<?php
include_once '../../config/init.php';

include_once '../../config/database.php';
include_once '../../models/Novel.php';

// เชื่อมต่อฐานข้อมูล
$database = new Database();
$db = $database->getConnection();

$novel = new Novel($db);

// รับ user_id จาก query string
$user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
if ($user_id <= 0) {
    http_response_code(400);
    echo json_encode(array("message" => "user_id ไม่ถูกต้องหรือขาดหายไป"));
    exit;
}

// Pagination
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
$offset = ($page - 1) * $limit;

// เรียกใช้ readByUser
$stmt = $novel->readByUser($user_id, $limit, $offset);
$num = $stmt->rowCount();

if ($num > 0) {
    $novel_arr = array();
    $novel_arr["records"] = array();

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $novel_item = array(
            "novel_id" => $row['novel_id'],
            "user_id" => $row['user_id'],
            "title" => $row['title'],
            "author_name" => $row['author_name'],
            "translator_name" => $row['translator_name'],
            "description" => $row['description'],
            "cover_image_url" => $row['cover_image_url'],
            "status" => $row['status'],
            "view_count" => $row['view_count'],
            "chapter_count" => $row['chapter_count'], // ✅ ใส่มาเรียบร้อย
            "created_at" => $row['created_at'],
            "updated_at" => $row['updated_at']
        );
        array_push($novel_arr["records"], $novel_item);
    }

    http_response_code(200);
    echo json_encode($novel_arr);
} else {
    http_response_code(404);
    echo json_encode(array("message" => "ไม่พบนิยายสำหรับผู้ใช้รายนี้"));
}
