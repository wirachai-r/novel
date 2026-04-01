<?php
include_once '../../config/init.php';

// รวมไฟล์ database และ models
include_once '../../config/database.php';
include_once '../../models/User.php';

$database = new Database();
$db = $database->getConnection();

$user = new User($db);
$data = json_decode(file_get_contents("php://input"));

// ตรวจสอบข้อมูลที่จำเป็นครบหรือไม่
if (
    !empty($data->firstname) &&
    !empty($data->lastname) &&
    !empty($data->email) &&
    !empty($data->password) &&
    !empty($data->display_name)
) {
    $user->firstname = $data->firstname;
    $user->lastname = $data->lastname;
    $user->email = $data->email;
    $user->password = $data->password;
    $user->display_name = $data->display_name;

    // ตรวจสอบว่ามีอีเมลนี้อยู่แล้วหรือไม่
    if ($user->emailExists()) {
        http_response_code(409); // ขัดแย้ง (Conflict)
        echo json_encode(["message" => "อีเมลนี้มีอยู่แล้ว."]);
        exit();
    }

    // สร้างผู้ใช้ใหม่
    if ($user->register()) {
        http_response_code(201); // สร้างสำเร็จ (Created)
        echo json_encode(["message" => "สร้างผู้ใช้สำเร็จ."]);
    } else {
        http_response_code(503); // บริการไม่พร้อม (Service Unavailable)
        echo json_encode(["message" => "ไม่สามารถสร้างผู้ใช้ได้."]);
    }
} else {
    http_response_code(400); // คำขอไม่ถูกต้อง (Bad Request)
    echo json_encode(["message" => "ไม่สามารถสร้างผู้ใช้ได้. ข้อมูลไม่ครบ."]);
}
?>
