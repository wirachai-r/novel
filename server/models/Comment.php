<?php
class Comment
{
    private $conn;
    private $table_name = "comments";

    public $comment_id;
    public $user_id;
    public $novel_id;
    public $chapter_number;
    public $parent_comment_id;
    public $content;
    public $created_at;
    public $updated_at;

    public $display_name;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function create()
    {
        $query = "INSERT INTO " . $this->table_name . "
                  SET
                    user_id = :user_id,
                    novel_id = :novel_id,
                    chapter_number = :chapter_number,
                    parent_comment_id = :parent_comment_id,
                    content = :content";

        $stmt = $this->conn->prepare($query);

        $this->user_id = htmlspecialchars(strip_tags($this->user_id));
        $this->novel_id = htmlspecialchars(strip_tags($this->novel_id));
        $this->content = htmlspecialchars(strip_tags($this->content));

        $this->chapter_number = !empty($this->chapter_number) ? htmlspecialchars(strip_tags($this->chapter_number)) : null;
        $this->parent_comment_id = !empty($this->parent_comment_id) ? htmlspecialchars(strip_tags($this->parent_comment_id)) : null;

        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":novel_id", $this->novel_id);
        $stmt->bindParam(":chapter_number", $this->chapter_number);
        $stmt->bindParam(":parent_comment_id", $this->parent_comment_id);
        $stmt->bindParam(":content", $this->content);

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }

    public function read()
    {
        $query = "SELECT
                    c.comment_id, c.user_id, c.parent_comment_id,
                    c.content, c.created_at, c.updated_at,
                    u.display_name
                  FROM
                    " . $this->table_name . " c
                  LEFT JOIN
                    users u ON c.user_id = u.user_id
                  WHERE
                    c.novel_id = :novel_id";

        if (!is_null($this->chapter_number)) {
            $query .= " AND c.chapter_number = :chapter_number";
        } else {
            $query .= " AND c.chapter_number IS NULL";
        }

        $query .= " ORDER BY c.created_at ASC";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":novel_id", $this->novel_id);

        if (!is_null($this->chapter_number)) {
            $stmt->bindParam(":chapter_number", $this->chapter_number);
        }

        $stmt->execute();
        return $stmt;
    }

    public function update()
    {
        $query = "UPDATE " . $this->table_name . "
                  SET
                    content = :content
                  WHERE
                    comment_id = :comment_id";

        $stmt = $this->conn->prepare($query);

        $this->content = htmlspecialchars(strip_tags($this->content));
        $this->comment_id = htmlspecialchars(strip_tags($this->comment_id));

        $stmt->bindParam(':content', $this->content);
        $stmt->bindParam(':comment_id', $this->comment_id);

        if ($stmt->execute() && $stmt->rowCount() > 0) {
            return true;
        }
        return false;
    }

    public function delete()
    {
        $query = "DELETE FROM " . $this->table_name . " WHERE comment_id = :comment_id";
        $stmt = $this->conn->prepare($query);

        $this->comment_id = htmlspecialchars(strip_tags($this->comment_id));

        $stmt->bindParam(':comment_id', $this->comment_id);

        if ($stmt->execute() && $stmt->rowCount() > 0) {
            return true;
        }
        return false;
    }
}
