<?php
include_once '../../config/init.php';

// รวมไฟล์ database และ model
include_once '../../config/database.php';
include_once '../../models/User.php';

// สร้าง connection และ object
$database = new Database();
$db = $database->getConnection();
$user = new User($db);

// อ่านข้อมูล JSON จาก request body
$data = json_decode(file_get_contents("php://input"));

// ตรวจสอบข้อมูล
if (!empty($data->user_id) && !empty($data->role)) {
    $user->user_id = $data->user_id;
    $user->role = $data->role;

    // อัปเดตสิทธิ์ผู้ใช้
    if ($user->updateRole()) {
        http_response_code(200);
        echo json_encode(["message" => "อัปเดตสิทธิ์ผู้ใช้เรียบร้อยแล้ว."]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "ไม่สามารถอัปเดตสิทธิ์ผู้ใช้ได้."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "ไม่สามารถอัปเดตสิทธิ์ผู้ใช้ได้. ข้อมูลไม่ครบ."]);
}
?>
