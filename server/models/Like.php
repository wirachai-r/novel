<?php
class Like
{
    private $conn;
    private $table_name = "likes";

    public $user_id;
    public $novel_id;
    public $created_at;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // กดถูกใจ
    public function like()
    {
        $query = "INSERT INTO " . $this->table_name . "
                  SET
                    user_id=:user_id,
                    novel_id=:novel_id";

        $stmt = $this->conn->prepare($query);

        $this->user_id = htmlspecialchars(strip_tags($this->user_id));
        $this->novel_id = htmlspecialchars(strip_tags($this->novel_id));

        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":novel_id", $this->novel_id);

        return $stmt->execute();
    }

    // ยกเลิกถูกใจ
    public function unlike()
    {
        $query = "DELETE FROM " . $this->table_name . "
                  WHERE user_id = :user_id AND novel_id = :novel_id";

        $stmt = $this->conn->prepare($query);

        $this->user_id = htmlspecialchars(strip_tags($this->user_id));
        $this->novel_id = htmlspecialchars(strip_tags($this->novel_id));

        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":novel_id", $this->novel_id);

        return $stmt->execute() && $stmt->rowCount() > 0;
    }

    // ตรวจสอบว่า user ถูกใจนิยายนี้แล้วหรือยัง
    public function isLiked()
    {
        $query = "SELECT 1 FROM " . $this->table_name . "
                  WHERE user_id = :user_id AND novel_id = :novel_id
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":novel_id", $this->novel_id);
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }
}
