<?php
include_once '../../config/init.php';

include_once '../../config/database.php';
include_once '../../models/Novel.php';

$database = new Database();
$db = $database->getConnection();

$novel = new Novel($db);

// รับค่า category_id, page, limit จาก query string
$category_id = isset($_GET['category_id']) ? (int)$_GET['category_id'] : 0;
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
$offset = ($page - 1) * $limit;

if ($category_id <= 0) {
    http_response_code(400);
    echo json_encode(["message" => "ต้องระบุ Category ID"]);
    exit;
}

// เรียกฟังก์ชัน readByCategory
$result = $novel->readByCategory($category_id, $limit, $offset);
$stmt = $result['stmt'];
$totalRecords = $result['totalRecords'];
$totalPages = ceil($totalRecords / $limit);

$novels_arr = [
    "records" => [],
    "totalRecords" => (int)$totalRecords,
    "totalPages" => (int)$totalPages,
    "message" => ""
];

$num = $stmt->rowCount();

if ($num > 0) {
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $novels_arr["records"][] = [
            "novel_id" => $row['novel_id'],
            "user_id" => $row['user_id'],
            "title" => $row['title'],
            "author_name" => $row['author_name'],
            "translator_name" => $row['translator_name'],
            "description" => $row['description'],
            "cover_image_url" => $row['cover_image_url'],
            "status" => $row['status'],
            "view_count" => (int)$row['view_count'],
            "chapter_count" => (int)$row['chapter_count'],
            "created_at" => $row['created_at'],
            "updated_at" => $row['updated_at']
        ];
    }
    $novels_arr["message"] = "ดึงข้อมูลนิยายเรียบร้อยแล้ว";
    http_response_code(200);
    echo json_encode($novels_arr);
} else {
    $novels_arr["message"] = "ไม่พบข้อมูลนิยายในหมวดหมู่นี้";
    http_response_code(200);
    echo json_encode($novels_arr);
}
?>
