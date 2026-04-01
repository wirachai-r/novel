<?php
include_once '../../config/init.php';
include_once '../../config/database.php';
include_once '../../models/Follow_writers.php'; // เปลี่ยนเป็น model นักเขียน

$database = new Database();
$db = $database->getConnection();
$followWriter = new FollowWriters($db);

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

// เรียกฟังก์ชัน getFollowedWriters
$result = $followWriter->getFollowedWriters($user_id, $limit, $offset);
$writers = $result['records'];
$totalRecords = $result['totalRecords'];
$totalPages = $result['totalPages'];

$response = [
    "records" => [],
    "totalRecords" => (int)$totalRecords,
    "totalPages" => (int)$totalPages,
    "message" => ""
];

if (count($writers) > 0) {
    foreach ($writers as $row) {
        $response["records"][] = [
            "writer_id" => $row['user_id'],
            "display_name" => $row['display_name'],
        ];
    }
    $response["message"] = "เรียกดูนักเขียนที่ติดตามสำเร็จ";
    http_response_code(200);
    echo json_encode($response);
} else {
    $response["message"] = "ไม่พบนักเขียนที่ติดตามสำหรับผู้ใช้คนนี้";
    http_response_code(200);
    echo json_encode($response);
}
