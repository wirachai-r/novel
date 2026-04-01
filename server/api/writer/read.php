<?php
include_once '../../config/init.php';

include_once '../../config/database.php';
include_once '../../models/Writer.php';

$database = new Database();
$db = $database->getConnection();

$writer = new Writer($db);

// รับค่า user_id, page, limit จาก GET
$user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
$offset = ($page - 1) * $limit;

// ตรวจสอบว่า user_id ถูกต้อง
if ($user_id <= 0) {
    http_response_code(400);
    echo json_encode(["message" => "จำเป็นต้องระบุ User ID"]);
    exit();
}

// อ่านนิยายของนักเขียน
$stmt = $writer->readByWriter($user_id, $limit, $offset);
$records = $stmt->fetchAll(PDO::FETCH_ASSOC);

// นับจำนวนทั้งหมด
$totalRecords = $writer->countAllByWriter($user_id);
$totalPages = ceil($totalRecords / $limit);

// เตรียม response
$response = [
    "records" => $records,
    "totalRecords" => (int)$totalRecords,
    "totalPages" => (int)$totalPages,
    "page" => $page,
    "limit" => $limit,
    "message" => count($records) > 0 ? "ดึงข้อมูลนิยายสำเร็จ" : "ไม่พบนิยาย"
];

http_response_code(200);
echo json_encode($response);
?>
