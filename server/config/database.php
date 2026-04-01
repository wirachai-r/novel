<?php
class Database
{
    private $host = "localhost";
    private $db_name = "novels";
    private $username = "root";
    private $password = "";
    // private $host = "student.crru.ac.th";
    // private $db_name = "db_661463035";
    // private $username = "661463035";
    // private $password = "78473";
    public $conn;

    public function getConnection()
    {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->exec("set names utf8");
        } catch (PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }
        return $this->conn;
    }
}
