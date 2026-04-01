<?php
class Banner
{
    private $conn;
    private $table_name = "banners";

    public $banner_id;
    public $title;
    public $image_url;
    public $position;
    public $status;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function read($limit = 0, $offset = 0)
    {
        $query = "SELECT * FROM " . $this->table_name;
        
        $query .= " ORDER BY position ASC";
        if ($limit > 0) {
            $query .= " LIMIT :offset, :limit";
        }

        $stmt = $this->conn->prepare($query);
        if ($limit > 0) {
            $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        }

        $stmt->execute();
        return $stmt;
    }

        public function readHome($limit = 0, $offset = 0, $onlyActive = true)
    {
        $query = "SELECT * FROM " . $this->table_name;
        if ($onlyActive) {
            $query .= " WHERE status = 1";
        }
        $query .= " ORDER BY position ASC";
        if ($limit > 0) {
            $query .= " LIMIT :offset, :limit";
        }

        $stmt = $this->conn->prepare($query);
        if ($limit > 0) {
            $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        }

        $stmt->execute();
        return $stmt;
    }

    public function countAll($onlyActive = true)
    {
        $query = "SELECT COUNT(*) as total FROM " . $this->table_name;
        if ($onlyActive) {
            $query .= " WHERE status = 1";
        }
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // อ่าน Banner ตาม ID
    public function readOne()
    {
        $query = "SELECT * FROM " . $this->table_name . " WHERE banner_id = :banner_id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":banner_id", $this->banner_id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $this->title = $row['title'];
            $this->image_url = $row['image_url'];
            $this->position = $row['position'];
            $this->status = $row['status'];
            return true;
        }
        return false;
    }

    // สร้าง Banner ใหม่
    public function create()
    {
        $query = "INSERT INTO banners (title, image_url, position, status)
              VALUES (:title, :image_url, :position, :status)";
        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':title', $this->title);
        $stmt->bindParam(':image_url', $this->image_url);
        $stmt->bindParam(':position', $this->position);
        $stmt->bindParam(':status', $this->status);

        return $stmt->execute();
    }


    // อัปเดต Banner
    public function update()
    {
        try {
            $query = "UPDATE " . $this->table_name . "
                      SET title = :title,
                          image_url = :image_url,
                          position = :position,
                          status = :status
                      WHERE banner_id = :banner_id";

            $stmt = $this->conn->prepare($query);

            $this->title = htmlspecialchars(strip_tags($this->title));
            $this->image_url = htmlspecialchars(strip_tags($this->image_url));
            $this->position = $this->position ?? 1;
            $this->status = $this->status ?? 1;

            $stmt->bindParam(":title", $this->title);
            $stmt->bindParam(":image_url", $this->image_url);
            $stmt->bindParam(":position", $this->position);
            $stmt->bindParam(":status", $this->status);
            $stmt->bindParam(":banner_id", $this->banner_id);

            return $stmt->execute();
        } catch (Exception $e) {
            error_log("Banner update error: " . $e->getMessage());
            return false;
        }
    }

    // ลบ Banner
    public function delete()
    {
        try {
            $query = "DELETE FROM " . $this->table_name . " WHERE banner_id = :banner_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":banner_id", $this->banner_id);
            return $stmt->execute();
        } catch (Exception $e) {
            error_log("Banner delete error: " . $e->getMessage());
            return false;
        }
    }
}
