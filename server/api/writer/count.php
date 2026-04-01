<?php
include_once '../../config/init.php';

include_once '../../config/database.php';
include_once '../../models/Writer.php';

$database = new Database();
$db = $database->getConnection();
$writer = new Writer($db);

// รับ user_id ผ่าน GET
$user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;

// ตรวจสอบว่า user_id ถูกต้องหรือไม่
if ($user_id <= 0) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "user_id หายไปหรือไม่ถูกต้อง"
    ]);
    exit();
}

// นับจำนวนนิยายของนักเขียน
$total = $writer->countAllByWriter($user_id);

http_response_code(200);
echo json_encode([
    "success" => true,
    "user_id" => $user_id,
    "totalNovels" => (int)$total
]);
