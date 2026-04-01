<?php
class Follow
{
  private $conn;
  private $table_name = "follows";

  public $user_id;
  public $novel_id;
  public $created_at;

  public function __construct($db)
  {
    $this->conn = $db;
  }

  public function follow()
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

    if ($stmt->execute()) {
      return true;
    }
    return false;
  }

  public function unfollow()
  {
    $query = "DELETE FROM " . $this->table_name . "
                  WHERE user_id = :user_id AND novel_id = :novel_id";

    $stmt = $this->conn->prepare($query);

    $this->user_id = htmlspecialchars(strip_tags($this->user_id));
    $this->novel_id = htmlspecialchars(strip_tags($this->novel_id));

    $stmt->bindParam(":user_id", $this->user_id);
    $stmt->bindParam(":novel_id", $this->novel_id);

    if ($stmt->execute() && $stmt->rowCount() > 0) {
      return true;
    }
    return false;
  }

  public function isFollowing()
  {
    $query = "SELECT 1 FROM " . $this->table_name . "
                  WHERE user_id = :user_id AND novel_id = :novel_id
                  LIMIT 1";

    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(":user_id", $this->user_id);
    $stmt->bindParam(":novel_id", $this->novel_id);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
      return true;
    }
    return false;
  }

public function getFollowedNovels($user_id, $limit = 10, $offset = 0)
{
    $query = "SELECT 
                 n.novel_id, 
                 n.user_id,
                 n.title, 
                 n.author_name, 
                 n.translator_name,
                 n.description, 
                 n.cover_image_url, 
                 n.status, 
                 n.view_count,
                 n.created_at, 
                 n.updated_at,
                 (SELECT COUNT(*) FROM chapters c WHERE c.novel_id = n.novel_id) AS chapter_count
              FROM " . $this->table_name . " f
              JOIN novels n ON f.novel_id = n.novel_id
              WHERE f.user_id = :user_id
              ORDER BY n.updated_at DESC
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
