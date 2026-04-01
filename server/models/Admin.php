<?php

class Admin
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // นับจำนวน user ทั้งหมด
    public function countAllUsers()
    {
        $query = "SELECT COUNT(DISTINCT user_id) as total FROM users";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    }

    // นับจำนวน novel ทั้งหมด
    public function countAllNovels()
    {
        $query = "SELECT COUNT(DISTINCT novel_id) as total FROM novels";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    }

    // นับจำนวน category ทั้งหมด
    public function countAllCategories()
    {
        $query = "SELECT COUNT(DISTINCT category_id) as total FROM categories";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    }
}
