<?php
include_once '../../config/init.php';

include_once '../../config/database.php';
include_once '../../models/User.php';

$database = new Database();
$db = $database->getConnection();
$user = new User($db);
$data = json_decode(file_get_contents("php://input"));

// ตรวจสอบว่ามี user_id และ password ส่งมาหรือไม่
if (!empty($data->user_id) && !empty($data->password)) {
    $user->user_id = $data->user_id;
    $user->password = password_hash($data->password, PASSWORD_DEFAULT); // เข้ารหัสรหัสผ่าน

    // อัปเดตรหัสผ่าน
    if ($user->updatePassword()) {
        http_response_code(200);
        echo json_encode(["message" => "อัปเดตรหัสผ่านสำเร็จ."]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "ไม่สามารถอัปเดตรหัสผ่านได้."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "ข้อมูลไม่ครบ."]);
}
?>
