<?php
include_once '../../config/init.php';

include_once '../../config/database.php';
include_once '../../models/Follow.php';

$database = new Database();
$db = $database->getConnection();
$follow = new Follow($db);

// รับค่า user_id, page, limit
$user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
$offset = ($page - 1) * $limit;

if ($user_id <= 0) {
    http_response_code(400);
    echo json_encode(["message" => "ต้องระบุ user_id"]);
    exit;
}

// เรียกฟังก์ชัน getFollowedNovels
$result = $follow->getFollowedNovels($user_id, $limit, $offset);
$novels = $result['records'];
$totalRecords = $result['totalRecords'];
$totalPages = $result['totalPages'];

$response = [
    "records" => [],
    "totalRecords" => (int)$totalRecords,
    "totalPages" => (int)$totalPages,
    "message" => ""
];

if (count($novels) > 0) {
    foreach ($novels as $row) {
        $response["records"][] = [
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
    $response["message"] = "เรียกดูนิยายที่ติดตามสำเร็จ";
    http_response_code(200);
    echo json_encode($response);
} else {
    $response["message"] = "ไม่พบนิยายที่ติดตามสำหรับผู้ใช้คนนี้";
    http_response_code(200);
    echo json_encode($response);
}
?>
