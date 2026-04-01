<?php

class Writer
{
    private $conn;
    private $table_name = "novels";

    public $novel_id;
    public $user_id;
    public $title;
    public $translator_name;
    public $description;
    public $cover_image_url;
    public $status;
    public $view_count;
    public $chapter_count;
    public $display_name;
    public $created_at;
    public $updated_at;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // อ่านนิยายของนักเขียนตาม user_id (paginated) พร้อม chapter_count
    public function readByWriter($user_id, $limit = 10, $offset = 0)
    {
        $query = "
            SELECT 
                n.*,
                u.display_name,
                (SELECT COUNT(*) FROM chapters c WHERE c.novel_id = n.novel_id) AS chapter_count
            FROM " . $this->table_name . " n
            INNER JOIN users u ON n.user_id = u.user_id
            WHERE n.user_id = :user_id
            ORDER BY n.created_at DESC
            LIMIT :limit OFFSET :offset
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':user_id', $user_id, PDO::PARAM_INT);
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt;
    }

    // นับจำนวนทั้งหมดของนักเขียน
    public function countAllByWriter($user_id)
    {
        $query = "SELECT COUNT(*) as total FROM " . $this->table_name . " WHERE user_id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':user_id', $user_id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    }

    // อัปเดตสถานะนิยาย
    public function updateStatus()
    {
        $query = "UPDATE " . $this->table_name . " 
                  SET status = :status, updated_at = NOW() 
                  WHERE novel_id = :novel_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':status', $this->status);
        $stmt->bindValue(':novel_id', $this->novel_id);
        return $stmt->execute();
    }
}
?>
