<?php
class FollowWriters
{
    private $conn;
    private $table_name = "follow_writers";

    public $user_id;    // ผู้ติดตาม
    public $writer_id;  // นักเขียนที่ถูกติดตาม
    public $created_at;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // ฟังก์ชันติดตามนักเขียน
    public function follow()
    {
        $query = "INSERT INTO " . $this->table_name . "
                  SET
                    user_id = :user_id,
                    writer_id = :writer_id";

        $stmt = $this->conn->prepare($query);

        $this->user_id = htmlspecialchars(strip_tags($this->user_id));
        $this->writer_id = htmlspecialchars(strip_tags($this->writer_id));

        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":writer_id", $this->writer_id);

        return $stmt->execute();
    }

    // ฟังก์ชันเลิกติดตามนักเขียน
    public function unfollow()
    {
        $query = "DELETE FROM " . $this->table_name . "
                  WHERE user_id = :user_id AND writer_id = :writer_id";

        $stmt = $this->conn->prepare($query);

        $this->user_id = htmlspecialchars(strip_tags($this->user_id));
        $this->writer_id = htmlspecialchars(strip_tags($this->writer_id));

        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":writer_id", $this->writer_id);

        return $stmt->execute() && $stmt->rowCount() > 0;
    }

    // ตรวจสอบว่าผู้ใช้ติดตามนักเขียนหรือไม่
    public function isFollowing()
    {
        $query = "SELECT 1 FROM " . $this->table_name . "
                  WHERE user_id = :user_id AND writer_id = :writer_id
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":writer_id", $this->writer_id);
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }

    // ดึงรายชื่อผู้เขียนที่ผู้ใช้ติดตาม พร้อมข้อมูลสรุป (เช่น นิยายล่าสุด)
    public function getFollowedWriters($user_id, $limit = 10, $offset = 0)
    {
        $query = "SELECT 
                    u.user_id,
                    u.display_name,
                    u.firstname,
                    u.lastname,
                    u.email,
                    u.role,
                    u.status,
                    u.created_at,
                    u.updated_at,
                    (SELECT COUNT(*) FROM novels n WHERE n.user_id = u.user_id) AS novel_count
                  FROM " . $this->table_name . " f
                  JOIN users u ON f.writer_id = u.user_id
                  WHERE f.user_id = :user_id
                  ORDER BY u.updated_at DESC
                  LIMIT :limit OFFSET :offset";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // นับจำนวนทั้งหมด
        $countQuery = "SELECT COUNT(*) as total FROM " . $this->table_name . " WHERE user_id = :user_id";
        $countStmt = $this->conn->prepare($countQuery);
        $countStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $countStmt->execute();
        $totalRecords = (int)$countStmt->fetch(PDO::FETCH_ASSOC)['total'];

        return [
            "records" => $rows,
            "totalRecords" => $totalRecords,
            "totalPages" => $limit > 0 ? ceil($totalRecords / $limit) : 1
        ];
    }
}
