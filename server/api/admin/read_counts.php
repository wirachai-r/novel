<?php
include_once '../../config/init.php';

include_once '../../config/database.php';
include_once '../../models/Admin.php';

// เชื่อมต่อฐานข้อมูล
$database = new Database();
$db = $database->getConnection();

$admin = new Admin($db);

try {
    $result_arr = [
        "totalUsers" => $admin->countAllUsers(),
        "totalNovels" => $admin->countAllNovels(),
        "totalCategories" => $admin->countAllCategories()
    ];

    http_response_code(200);
    echo json_encode($result_arr);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "ดึงข้อมูลจำนวนไม่สำเร็จ",
        "error" => $e->getMessage()
    ]);
}
