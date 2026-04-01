<?php
class Chapter
{
  private $conn;
  private $table_name = "chapters";

  public $novel_id;
  public $chapter_number;
  public $title;
  public $content;
  public $created_at;
  public $updated_at;

  public $novel_title;

  public function __construct($db)
  {
    $this->conn = $db;
  }

  public function readByNovelId()
  {
    $query = "SELECT
                    c.novel_id, c.chapter_number,
                    c.title, c.created_at, c.updated_at
                  FROM
                    " . $this->table_name . " c
                  WHERE
                    c.novel_id = :novel_id
                  ORDER BY
                    c.chapter_number ASC";

    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(":novel_id", $this->novel_id);
    $stmt->execute();

    return $stmt;
  }

  public function readOne()
  {
    $query = "SELECT
                    c.*,
                    n.title as novel_title
                  FROM
                    " . $this->table_name . " c
                  LEFT JOIN
                    novels n ON c.novel_id = n.novel_id
                  WHERE
                    c.novel_id = :novel_id AND c.chapter_number = :chapter_number
                  LIMIT 1";

    $stmt = $this->conn->prepare($query);

    $stmt->bindParam(":novel_id", $this->novel_id);
    $stmt->bindParam(":chapter_number", $this->chapter_number);
    $stmt->execute();

    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($row) {
      $this->novel_id = $row['novel_id'];
      $this->chapter_number = $row['chapter_number'];
      $this->title = $row['title'];
      $this->content = $row['content'];
      $this->created_at = $row['created_at'];
      $this->updated_at = $row['updated_at'];
      $this->novel_title = $row['novel_title'];

      return true;
    }

    return false;
  }

  public function create()
  {
    $this->conn->beginTransaction();

    try {
      $query = "INSERT INTO " . $this->table_name . "
                  (novel_id, chapter_number, title, content, created_at, updated_at)
                  VALUES (:novel_id, :chapter_number, :title, :content, NOW(), NOW())";

      $stmt = $this->conn->prepare($query);

      $this->novel_id = htmlspecialchars(strip_tags($this->novel_id));
      $this->chapter_number = htmlspecialchars(strip_tags($this->chapter_number));
      $this->title = htmlspecialchars(strip_tags($this->title));
      // content ไม่ strip_tags เผื่อเก็บ HTML
      // $this->content = htmlspecialchars($this->content);

      $stmt->bindParam(":novel_id", $this->novel_id);
      $stmt->bindParam(":chapter_number", $this->chapter_number);
      $stmt->bindParam(":title", $this->title);
      $stmt->bindParam(":content", $this->content);

      $stmt->execute();

      // update novel updated_at
      $query_novel = "UPDATE novels SET updated_at = CURRENT_TIMESTAMP WHERE novel_id = :novel_id";
      $stmt_novel = $this->conn->prepare($query_novel);
      $stmt_novel->bindParam(":novel_id", $this->novel_id);
      $stmt_novel->execute();

      $this->conn->commit();
      return true;
    } catch (Exception $e) {
      $this->conn->rollBack();
      error_log("Chapter create error: " . $e->getMessage()); // ✅ log error
      return false;
    }
  }


  public function update()
  {
    $query = "UPDATE " . $this->table_name . "
                  SET
                    title = :title,
                    content = :content,
                    updated_at = NOW()
                  WHERE
                    novel_id = :novel_id AND chapter_number = :chapter_number";

    $stmt = $this->conn->prepare($query);

    $this->title = htmlspecialchars(strip_tags($this->title));
    $this->novel_id = htmlspecialchars(strip_tags($this->novel_id));
    $this->chapter_number = htmlspecialchars(strip_tags($this->chapter_number));

    $stmt->bindParam(':title', $this->title);
    $stmt->bindParam(':content', $this->content);
    $stmt->bindParam(':novel_id', $this->novel_id);
    $stmt->bindParam(':chapter_number', $this->chapter_number);

    if ($stmt->execute()) {
      return true;
    }
    return false;
  }

  public function delete()
  {
    // หาค่า chapter_number สูงสุดของนิยายนี้
    $query_max = "SELECT MAX(chapter_number) as max_chapter FROM " . $this->table_name . " WHERE novel_id = :novel_id";
    $stmt_max = $this->conn->prepare($query_max);
    $stmt_max->bindParam(':novel_id', $this->novel_id);
    $stmt_max->execute();
    $row = $stmt_max->fetch(PDO::FETCH_ASSOC);

    if (!$row || $row['max_chapter'] < $this->chapter_number) {
      // ไม่มี chapter หรือ chapter_number ที่ส่งมาสูงกว่าที่มีอยู่
      return false;
    }

    // ลบตั้งแต่ chapter_number ล่าสุดลงมาถึง chapter_number ที่ส่งมา
    $query = "DELETE FROM " . $this->table_name . " 
              WHERE novel_id = :novel_id AND chapter_number BETWEEN :chapter_number AND :max_chapter";

    $stmt = $this->conn->prepare($query);

    $this->novel_id = htmlspecialchars(strip_tags($this->novel_id));
    $this->chapter_number = htmlspecialchars(strip_tags($this->chapter_number));
    $max_chapter = $row['max_chapter'];

    $stmt->bindParam(':novel_id', $this->novel_id);
    $stmt->bindParam(':chapter_number', $this->chapter_number);
    $stmt->bindParam(':max_chapter', $max_chapter);

    if ($stmt->execute()) {
      if ($stmt->rowCount() > 0) {
        return true;
      }
    }

    return false;
  }


  public function readChapterByNumber($chapter_number)
  {
    $query = "SELECT
                c.*,
                n.title as novel_title
              FROM
                " . $this->table_name . " c
              LEFT JOIN
                novels n ON c.novel_id = n.novel_id
              WHERE
                c.novel_id = :novel_id AND c.chapter_number = :chapter_number
              LIMIT 1";

    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(":novel_id", $this->novel_id);
    $stmt->bindParam(":chapter_number", $chapter_number);
    $stmt->execute();

    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($row) {
      $this->chapter_number = $row['chapter_number'];
      $this->title = $row['title'];
      $this->content = $row['content'];
      $this->created_at = $row['created_at'];
      $this->updated_at = $row['updated_at'];
      $this->novel_title = $row['novel_title'];
      return true;
    }
    return false;
  }
}
