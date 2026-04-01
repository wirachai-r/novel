<?php
class Novel
{
    private $conn;
    private $table_name = "novels";

    public $novel_id;
    public $user_id;
    public $title;
    public $author_name;
    public $translator_name;
    public $description;
    public $cover_image_url;
    public $status;
    public $view_count;
    public $created_at;
    public $updated_at;
    public $chapter_count;

    public $categories;

    public $comment_count;
    
    public $like_count;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function read($limit, $offset)
    {
        $query = "SELECT 
                n.*,
                u.display_name,
                (SELECT COUNT(*) FROM chapters c WHERE c.novel_id = n.novel_id) AS chapter_count
              FROM " . $this->table_name . " n
              LEFT JOIN users u ON n.user_id = u.user_id
              ORDER BY n.updated_at DESC
              LIMIT :limit OFFSET :offset";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt;
    }

    public function countAll()
    {
        $query = "SELECT COUNT(*) as total FROM " . $this->table_name;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Read Novel
    public function readMax($limit = 0, $offset = 0)
    {
        // join กับ chapter เพื่อนับจำนวนบท
        $query = "
        SELECT n.novel_id, n.user_id, n.title, n.author_name, n.translator_name, 
               n.description, n.cover_image_url, n.status, n.view_count, n.created_at, n.updated_at,
               COUNT(c.chapter_number) AS chapter_count
        FROM " . $this->table_name . " AS n
        LEFT JOIN chapters AS c ON n.novel_id = c.novel_id
        WHERE n.status != 'draft'
        GROUP BY n.novel_id
        ORDER BY n.view_count DESC
    ";

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

    public function novelUpdate($limit = 0, $offset = 0)
    {
        // join กับ chapter เพื่อนับจำนวนบทที่ไม่ใช่ draft
        $query = "
        SELECT n.novel_id, n.user_id, n.title, n.author_name, n.translator_name, 
               n.description, n.cover_image_url, n.status, n.view_count, n.created_at, n.updated_at,
               COUNT(c.chapter_number) AS chapter_count
        FROM " . $this->table_name . " AS n
        LEFT JOIN chapters AS c ON n.novel_id = c.novel_id
        WHERE n.status != 'draft'
        GROUP BY n.novel_id
        ORDER BY n.updated_at DESC
    ";

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


    public function updateStatus()
    {
        $query = "UPDATE " . $this->table_name . " 
              SET status = :status 
              WHERE novel_id = :novel_id";
        $stmt = $this->conn->prepare($query);

        $this->status = htmlspecialchars(strip_tags($this->status));
        $this->novel_id = htmlspecialchars(strip_tags($this->novel_id));

        $stmt->bindParam(":status", $this->status, PDO::PARAM_STR);
        $stmt->bindParam(":novel_id", $this->novel_id, PDO::PARAM_INT);

        return $stmt->execute();
    }

    // Create Novel
    public function create()
    {
        // ใช้ TRANSACTION เพื่อให้แน่ใจว่าข้อมูลจะถูกบันทึกทั้งหมดหรือยกเลิกทั้งหมด
        $this->conn->beginTransaction();

        try {
            $query = "INSERT INTO " . $this->table_name . "
                SET
                    user_id=:user_id,
                    title=:title,
                    author_name=:author_name,
                    translator_name=:translator_name,
                    description=:description,
                    cover_image_url=:cover_image_url,
                    status=:status,
                    view_count=:view_count,
                    created_at=:created_at,
                    updated_at=:updated_at";

            $stmt = $this->conn->prepare($query);

            $this->user_id = htmlspecialchars(strip_tags($this->user_id));
            $this->title = htmlspecialchars(strip_tags($this->title));
            $this->author_name = htmlspecialchars(strip_tags($this->author_name));
            $this->translator_name = htmlspecialchars(strip_tags($this->translator_name));
            $this->description = htmlspecialchars(strip_tags($this->description));
            $this->cover_image_url = htmlspecialchars(strip_tags($this->cover_image_url));
            $this->status = htmlspecialchars(strip_tags($this->status));
            $this->view_count = htmlspecialchars(strip_tags($this->view_count));
            $this->updated_at = date('Y-m-d H:i:s');

            $stmt->bindParam(":user_id", $this->user_id);
            $stmt->bindParam(":title", $this->title);
            $stmt->bindParam(":author_name", $this->author_name);
            $stmt->bindParam(":translator_name", $this->translator_name);
            $stmt->bindParam(":description", $this->description);
            $stmt->bindParam(":cover_image_url", $this->cover_image_url);
            $stmt->bindParam(":status", $this->status);
            $stmt->bindParam(":view_count", $this->view_count);
            $stmt->bindParam(":created_at", $this->created_at);
            $stmt->bindParam(":updated_at", $this->updated_at);

            $stmt->execute();

            $this->novel_id = $this->conn->lastInsertId();

            if (!empty($this->categories) && is_array($this->categories)) {
                $query_cat = "INSERT INTO novel_category (novel_id, category_id) VALUES (:novel_id, :category_id)";
                $stmt_cat = $this->conn->prepare($query_cat);

                $stmt_cat->bindParam(":novel_id", $this->novel_id);

                foreach ($this->categories as $category_id) {
                    $stmt_cat->bindValue(":category_id", $category_id);
                    $stmt_cat->execute();
                }
            }

            $this->conn->commit();
            return true;
        } catch (Exception $e) {
            $this->conn->rollBack();
            return false;
        }
    }

    public function readOne($returnArray = false)
    {
        $query = "SELECT
            n.*,
            COUNT(DISTINCT ch.chapter_number) AS chapter_count,
            COUNT(DISTINCT CASE WHEN cm.chapter_number IS NULL THEN cm.comment_id END) AS comment_count,
            (SELECT COUNT(*) FROM likes l WHERE l.novel_id = n.novel_id) AS like_count,  -- ✅ นับจำนวนไลค์
            GROUP_CONCAT(DISTINCT cat.category_id SEPARATOR ',') AS category_ids,
            GROUP_CONCAT(DISTINCT cat.name SEPARATOR ',') AS category_names
          FROM " . $this->table_name . " n
          LEFT JOIN chapters ch ON n.novel_id = ch.novel_id
          LEFT JOIN comments cm ON n.novel_id = cm.novel_id
          LEFT JOIN novel_category nc ON n.novel_id = nc.novel_id
          LEFT JOIN categories cat ON nc.category_id = cat.category_id
          WHERE n.novel_id = :novel_id
          GROUP BY n.novel_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':novel_id', $this->novel_id);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $this->novel_id = $row['novel_id'];
            $this->title = $row['title'];
            $this->author_name = $row['author_name'];
            $this->translator_name = $row['translator_name'];
            $this->description = $row['description'];
            $this->cover_image_url = $row['cover_image_url'];
            $this->status = $row['status'];
            $this->view_count = $row['view_count'];
            $this->updated_at = $row['updated_at'];
            $this->chapter_count = $row['chapter_count'];
            $this->comment_count = $row['comment_count'];
            $this->like_count = $row['like_count']; // ✅ เพิ่มตรงนี้

            // categories
            $this->categories = [];
            if ($row['category_ids']) {
                $category_ids = explode(',', $row['category_ids']);
                $category_names = explode(',', $row['category_names']);
                for ($i = 0; $i < count($category_ids); $i++) {
                    $this->categories[] = [
                        'category_id' => $category_ids[$i],
                        'name' => $category_names[$i]
                    ];
                }
            }

            if ($returnArray) {
                $row['categories'] = $this->categories;
                $row['comment_count'] = $this->comment_count;
                $row['like_count'] = $this->like_count; // ✅
                return $row;
            }
        }

        return null;
    }


    // Update novel
    public function update()
    {
        $this->conn->beginTransaction();

        try {
            $query = "UPDATE " . $this->table_name . "
                SET
                    title = :title,
                    author_name = :author_name,
                    translator_name = :translator_name,
                    description = :description,
                    cover_image_url = :cover_image_url,
                    status = :status,
                    updated_at = :updated_at
                WHERE
                    novel_id = :novel_id";

            $stmt = $this->conn->prepare($query);

            $this->title = htmlspecialchars(strip_tags($this->title));
            $this->author_name = htmlspecialchars(strip_tags($this->author_name));
            $this->translator_name = htmlspecialchars(strip_tags($this->translator_name));
            $this->description = htmlspecialchars(strip_tags($this->description));
            $this->cover_image_url = htmlspecialchars(strip_tags($this->cover_image_url));
            $this->status = htmlspecialchars(strip_tags($this->status));
            $this->novel_id = htmlspecialchars(strip_tags($this->novel_id));
            $this->updated_at = date('Y-m-d H:i:s');

            $stmt->bindParam(':title', $this->title);
            $stmt->bindParam(':author_name', $this->author_name);
            $stmt->bindParam(':translator_name', $this->translator_name);
            $stmt->bindParam(':description', $this->description);
            $stmt->bindParam(':cover_image_url', $this->cover_image_url);
            $stmt->bindParam(':status', $this->status);
            $stmt->bindParam(':updated_at', $this->updated_at);
            $stmt->bindParam(':novel_id', $this->novel_id);

            $stmt->execute();

            $query_del_cat = "DELETE FROM novel_category WHERE novel_id = :novel_id";
            $stmt_del_cat = $this->conn->prepare($query_del_cat);
            $stmt_del_cat->bindParam(":novel_id", $this->novel_id);
            $stmt_del_cat->execute();

            if (!empty($this->categories) && is_array($this->categories)) {
                $query_add_cat = "INSERT INTO novel_category (novel_id, category_id) VALUES (:novel_id, :category_id)";
                $stmt_add_cat = $this->conn->prepare($query_add_cat);
                $stmt_add_cat->bindParam(":novel_id", $this->novel_id);

                foreach ($this->categories as $category_id) {
                    $stmt_add_cat->bindValue(":category_id", $category_id);
                    $stmt_add_cat->execute();
                }
            }

            $this->conn->commit();
            return true;
        } catch (Exception $e) {
            $this->conn->rollBack();
            return false;
        }
    }

    // Delete Novel
    public function delete()
    {
        $query = "DELETE FROM " . $this->table_name . " WHERE novel_id = :novel_id";
        $stmt = $this->conn->prepare($query);
        $this->novel_id = htmlspecialchars(strip_tags($this->novel_id));
        $stmt->bindParam(':novel_id', $this->novel_id);
        if ($stmt->execute()) {
            if ($stmt->rowCount() > 0) {
                return true;
            } else {
                return false;
            }
        }
        return false;
    }

    // public function search($keywords)
    // {
    //     $query = "SELECT n.novel_id, n.user_id, n.title, n.author_name, n.translator_name, n.description, n.cover_image_url, n.status, n.view_count, n.created_at, n.updated_at 
    //               FROM " . $this->table_name . " as n 
    //               LEFT JOIN chapters as c ON n.novel_id = c.novel_id
    //               LEFT JOIN novel_category as nc ON n.novel_id = nc.novel_id
    //               LEFT JOIN categories as cat ON nc.category_id = cat.category_id
    //               where n.status != 'draft' AND  n.title LIKE :keywords OR n.description LIKE :keywords OR cat.name LIKE :keywords
    //               GROUP BY n.novel_id
    //               ORDER BY c.created_at DESC";
    //     $stmt = $this->conn->prepare($query);
    //     $keywords = htmlspecialchars(strip_tags($keywords));
    //     $keywords = "%{$keywords}%";
    //     $stmt->bindParam(':keywords', $keywords);
    //     $stmt->execute();

    //     return $stmt;
    // }

    // Read Novels ของผู้ใช้คนเดียว
    public function readByUser($user_id, $limit = 0, $offset = 0)
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
                 (SELECT COUNT(*) 
                  FROM chapters c 
                  WHERE c.novel_id = n.novel_id) AS chapter_count
              FROM " . $this->table_name . " AS n
              WHERE n.user_id = :user_id
              ORDER BY n.updated_at DESC";

        if ($limit > 0) {
            $query .= " LIMIT :limit OFFSET :offset";
        }

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);

        if ($limit > 0) {
            $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
        }

        $stmt->execute();
        return $stmt;
    }

    public function updateView()
    {
        // เพิ่ม view_count แต่อย่าให้ updated_at เปลี่ยน
        $query = "UPDATE novels 
              SET view_count = view_count + 1,
              updated_at = updated_at
              WHERE novel_id = :novel_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":novel_id", $this->novel_id, PDO::PARAM_INT);

        return $stmt->execute();
    }

    // อ่านนิยายตาม category_id พร้อม pagination
    public function readByCategory($category_id, $limit = 0, $offset = 0)
    {
        // นับ total records ก่อน
        $countQuery = "
        SELECT COUNT(DISTINCT n.novel_id) AS total
        FROM novels AS n
        LEFT JOIN novel_category AS nc ON n.novel_id = nc.novel_id
        WHERE n.status != 'draft' AND nc.category_id = :category_id
    ";
        $countStmt = $this->conn->prepare($countQuery);
        $countStmt->bindParam(':category_id', $category_id, PDO::PARAM_INT);
        $countStmt->execute();
        $totalRecords = (int)$countStmt->fetch(PDO::FETCH_ASSOC)['total'];

        // Query หลัก
        $query = "
        SELECT 
            n.novel_id, n.user_id, n.title, n.author_name, n.translator_name, 
            n.description, n.cover_image_url, n.status, n.view_count, n.created_at, n.updated_at,
            COUNT(ch.chapter_number) AS chapter_count
        FROM novels AS n
        LEFT JOIN chapters AS ch ON n.novel_id = ch.novel_id
        LEFT JOIN novel_category AS nc ON n.novel_id = nc.novel_id
        WHERE n.status != 'draft' AND nc.category_id = :category_id
        GROUP BY n.novel_id
        ORDER BY n.updated_at DESC
    ";

        if ($limit > 0) {
            $query .= " LIMIT :limit OFFSET :offset";
        }

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':category_id', $category_id, PDO::PARAM_INT);

        if ($limit > 0) {
            $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
        }

        $stmt->execute();

        return ['stmt' => $stmt, 'totalRecords' => $totalRecords];
    }

    public function search($limit, $offset, $search = "", $category_id = 0)
    {
        $query = "SELECT 
            n.*,
            u.display_name,
            (SELECT COUNT(*) FROM chapters c WHERE c.novel_id = n.novel_id) AS chapter_count
          FROM novels n
          LEFT JOIN users u ON n.user_id = u.user_id";

        // ถ้า filter category
        if ($category_id > 0) {
            $query .= " INNER JOIN novel_category nc ON nc.novel_id = n.novel_id
                AND nc.category_id = :category_id";
        }

        $query .= " WHERE 1=1 and n.status != 'draft'";

        // search filter
        if (!empty($search)) {
            $query .= " AND n.title LIKE :search";
        }

        $query .= " ORDER BY n.updated_at DESC LIMIT :limit OFFSET :offset";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);

        if (!empty($search)) {
            $searchParam = "%$search%";
            $stmt->bindParam(':search', $searchParam, PDO::PARAM_STR);
        }

        if ($category_id > 0) {
            $stmt->bindParam(':category_id', $category_id, PDO::PARAM_INT);
        }

        $stmt->execute();
        return $stmt;
    }

    // นับ filtered
    public function countAllFiltered($search = "", $category_id = 0)
    {
        $query = "SELECT COUNT(DISTINCT n.novel_id) AS total
              FROM novels n";

        // ถ้า filter category
        if ($category_id > 0) {
            $query .= " INNER JOIN novel_category nc ON nc.novel_id = n.novel_id
                    AND nc.category_id = :category_id";
        }

        $query .= " WHERE 1=1";

        // search filter
        if (!empty($search)) {
            $query .= " AND n.title LIKE :search";
        }

        $stmt = $this->conn->prepare($query);

        if (!empty($search)) {
            $searchParam = "%$search%";
            $stmt->bindParam(':search', $searchParam, PDO::PARAM_STR);
        }

        if ($category_id > 0) {
            $stmt->bindParam(':category_id', $category_id, PDO::PARAM_INT);
        }

        $stmt->execute();
        return $stmt;
    }
}
