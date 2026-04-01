<?php
include_once '../../config/init.php';

include_once '../../config/database.php';
include_once '../../models/User.php';

$database = new Database();
$db = $database->getConnection();

$user = new User($db);

// ตรวจสอบว่ามีการส่ง user_id มาหรือไม่
if (!isset($_GET['user_id'])) {
    http_response_code(400); // คำขอไม่ถูกต้อง (Bad Request)
    echo json_encode(["message" => "คำขอไม่ถูกต้อง. ไม่มี user_id ส่งมา."]);
    return;
}

$user->user_id = $_GET['user_id'];

// ดึงข้อมูลผู้ใช้
$user->readOne();

if ($user->display_name != null) {
    $user_arr = [
        "user_id" => (int)$user->user_id,
        "firstname" => $user->firstname,
        "lastname" => $user->lastname,
        "email" => $user->email,
        "display_name" => $user->display_name,
        "created_at" => $user->created_at
    ];

    http_response_code(200); // สำเร็จ (OK)
    echo json_encode($user_arr);
} else {
    http_response_code(404); // ไม่พบข้อมูล (Not Found)
    echo json_encode(["message" => "ไม่พบผู้ใช้งาน."]);
}
?>
