<?php
class Category
{
    private $conn;
    private $table_name = "categories";

    public $category_id;
    public $name;
    public $description;
    public $created_at;
    public $updated_at;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // Read Category
    public function read($limit = 0, $offset = 0)
    {
        $query = "SELECT category_id, name, description FROM " . $this->table_name . " ORDER BY name";
        if ($limit > 0) {
            $query .= " LIMIT :limit OFFSET :offset";
        }
        $stmt = $this->conn->prepare($query);
        if ($limit > 0) {
            $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
        }
        $stmt->execute();
        return $stmt;
    }

    // Create category
    public function create()
    {
        $query = "INSERT INTO " . $this->table_name . " SET name=:name, description=:description, created_at=:created_at, updated_at=:updated_at";
        $stmt = $this->conn->prepare($query);

        // sanitize
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->created_at = htmlspecialchars(strip_tags($this->created_at));
        $this->updated_at = htmlspecialchars(strip_tags($this->updated_at));

        // bind values
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":created_at", $this->created_at);
        $stmt->bindParam(":updated_at", $this->updated_at);

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Update category
    public function update()
    {
        $query = "UPDATE " . $this->table_name . " SET name = :name, description = :description, updated_at = :updated_at WHERE category_id = :category_id";
        $stmt = $this->conn->prepare($query);

        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->updated_at = htmlspecialchars(strip_tags($this->updated_at));
        $this->category_id = htmlspecialchars(strip_tags($this->category_id));

        $stmt->bindParam(':name', $this->name);
        $stmt->bindParam(':description', $this->description);
        $stmt->bindParam(':updated_at', $this->updated_at);
        $stmt->bindParam(':category_id', $this->category_id);

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }

    public function delete()
    {
        $query = "DELETE FROM " . $this->table_name . " WHERE category_id = ?";
        $stmt = $this->conn->prepare($query);

        // แปลง category_id เป็น integer
        $this->category_id = (int)$this->category_id;

        if ($stmt->execute([$this->category_id])) {
            return true;
        }
        return false;
    }

    public function countAll()
    {
        $query = "SELECT COUNT(*) as total FROM " . $this->table_name;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }
}
