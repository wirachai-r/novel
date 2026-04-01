<?php
class User
{
    private $conn;
    private $table_name = "users";

    public $user_id;
    public $firstname;
    public $lastname;
    public $email;
    public $password;
    public $display_name;
    public $role;
    public $status;
    public $created_at;
    public $updated_at;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function read($limit = 0, $offset = 0)
    {
        $query = "SELECT user_id, firstname, lastname, email, display_name, role, status, created_at, updated_at
                  FROM " . $this->table_name . "
                  ORDER BY firstname";
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
    public function register()
    {
        // sanitize
        $this->firstname = htmlspecialchars(strip_tags($this->firstname));
        $this->lastname = htmlspecialchars(strip_tags($this->lastname));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->display_name = htmlspecialchars(strip_tags($this->display_name));

        // default values
        $this->role = $this->role ?: "user";   // ค่าเริ่มต้น user
        $this->status = $this->status ?: 1;    // ค่าเริ่มต้น active

        // hash password ถ้ามี
        if (!empty($this->password)) {
            $this->password = password_hash($this->password, PASSWORD_BCRYPT);
        } else {
            $this->password = null; // กรณี Google login
        }

        $query = "INSERT INTO " . $this->table_name . "
              SET
                firstname=:firstname,
                lastname=:lastname,
                email=:email,
                password=:password,
                display_name=:display_name,
                role=:role,
                status=:status,
                created_at=NOW(),
                updated_at=NOW()";

        $stmt = $this->conn->prepare($query);

        // bind
        $stmt->bindParam(":firstname", $this->firstname);
        $stmt->bindParam(":lastname", $this->lastname);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":password", $this->password);
        $stmt->bindParam(":display_name", $this->display_name);
        $stmt->bindParam(":role", $this->role);
        $stmt->bindParam(":status", $this->status);

        if ($stmt->execute()) {
            $this->user_id = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }


    public function emailExists()
    {
        $query = "SELECT user_id FROM " . $this->table_name . " WHERE email = :email LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $this->email = htmlspecialchars(strip_tags($this->email));
        $stmt->bindParam(":email", $this->email);
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }

    public function getByEmail()
    {
        $query = "SELECT id, firstname, lastname, display_name, email, role 
                  FROM " . $this->table_name . " 
                  WHERE email = :email 
                  LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $this->email);
        $stmt->execute();

        if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $this->user_id = $row['id'];
            $this->firstname = $row['firstname'];
            $this->lastname = $row['lastname'];
            $this->display_name = $row['display_name'];
            $this->email = $row['email'];
            $this->role = $row['role'];
            return true;
        }
        return false;
    }

    public function readOneByEmail()
    {
        $query = "SELECT * FROM " . $this->table_name . " WHERE email=:email LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $this->email);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $this->user_id = $row['user_id'];
            $this->firstname = $row['firstname'];
            $this->lastname = $row['lastname'];
            $this->display_name = $row['display_name'];
            $this->role = $row['role'];
            $this->status = $row['status'];
        }
    }


    public function login()
    {
        $query = "SELECT * FROM " . $this->table_name . " WHERE email = :email LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $this->email);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row && password_verify($this->password, $row['password'])) {
            if ($row['status'] != 1) { // ✅ ตรวจสอบ status
                return false;
            }
            $this->user_id = $row['user_id'];
            $this->firstname = $row['firstname'];
            $this->lastname = $row['lastname'];
            $this->display_name = $row['display_name'];
            $this->role = $row['role'];
            $this->status = $row['status'];
            return true;
        }
        return false;
    }


    public function readOne()
    {
        $query = "SELECT user_id, firstname, lastname, email, display_name, role, status, created_at, updated_at
                  FROM " . $this->table_name . "
                  WHERE user_id = :user_id
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            foreach ($row as $key => $val) {
                $this->$key = $val;
            }
        }
    }

    public function update()
    {
        $query = "UPDATE " . $this->table_name . "
                  SET
                    firstname = :firstname,
                    lastname = :lastname,
                    display_name = :display_name,
                    updated_at = NOW()
                  WHERE user_id = :user_id";

        $stmt = $this->conn->prepare($query);

        // sanitize
        $this->firstname = htmlspecialchars(strip_tags($this->firstname));
        $this->lastname = htmlspecialchars(strip_tags($this->lastname));
        $this->display_name = htmlspecialchars(strip_tags($this->display_name));
        $this->user_id = htmlspecialchars(strip_tags($this->user_id));

        // bind
        $stmt->bindParam(':firstname', $this->firstname);
        $stmt->bindParam(':lastname', $this->lastname);
        $stmt->bindParam(':display_name', $this->display_name);
        $stmt->bindParam(':user_id', $this->user_id);

        return $stmt->execute();
    }

    public function updateRole()
    {
        $query = "UPDATE " . $this->table_name . "
                  SET role = :role, updated_at = NOW()
                  WHERE user_id = :user_id";
        $stmt = $this->conn->prepare($query);

        $this->role = htmlspecialchars(strip_tags($this->role));
        $this->user_id = htmlspecialchars(strip_tags($this->user_id));

        $stmt->bindParam(':role', $this->role);
        $stmt->bindParam(':user_id', $this->user_id);

        return $stmt->execute();
    }

    public function updateStatus()
    {
        $query = "UPDATE " . $this->table_name . "
                  SET status = :status, updated_at = NOW()
                  WHERE user_id = :user_id";
        $stmt = $this->conn->prepare($query);

        $this->status = htmlspecialchars(strip_tags($this->status));
        $this->user_id = htmlspecialchars(strip_tags($this->user_id));

        $stmt->bindParam(':status', $this->status);
        $stmt->bindParam(':user_id', $this->user_id);

        return $stmt->execute();
    }

    public function countAll()
    {
        $query = "SELECT COUNT(*) as total FROM " . $this->table_name;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchColumn();
    }

    public function updatePassword()
    {
        $query = "UPDATE " . $this->table_name . " SET password = :password, updated_at = NOW() WHERE user_id = :user_id";
        $stmt = $this->conn->prepare($query);

        $this->password = htmlspecialchars(strip_tags($this->password));
        $this->user_id = htmlspecialchars(strip_tags($this->user_id));

        $stmt->bindParam(':password', $this->password);
        $stmt->bindParam(':user_id', $this->user_id);

        return $stmt->execute();
    }
}
