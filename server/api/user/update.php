<?php
include_once '../../config/init.php';

// รวมไฟล์ database และ model
include_once '../../config/database.php';
include_once '../../models/User.php';

// สร้าง connection และ object
$database = new Database();
$db = $database->getConnection();
$user = new User($db);
$data = json_decode(file_get_contents("php://input"));

// ตรวจสอบข้อมูล
if (!empty($data->user_id) && !empty($data->firstname) && !empty($data->lastname) && !empty($data->display_name)) {
    $user->user_id = $data->user_id;
    $user->firstname = $data->firstname;
    $user->lastname = $data->lastname;
    $user->display_name = $data->display_name;

    // อัปเดตข้อมูลโปรไฟล์ผู้ใช้
    if ($user->update()) {
        http_response_code(200);
        echo json_encode(["message" => "อัปเดตโปรไฟล์ผู้ใช้เรียบร้อยแล้ว."]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "ไม่สามารถอัปเดตโปรไฟล์ผู้ใช้ได้."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "ไม่สามารถอัปเดตโปรไฟล์ผู้ใช้ได้. ข้อมูลไม่ครบ."]);
}
?>
