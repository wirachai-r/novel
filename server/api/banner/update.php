<?php
include_once '../../config/init.php';

include_once '../../config/database.php';
include_once '../../models/Banner.php';

$database = new Database();
$db = $database->getConnection();

$banner = new Banner($db);

// ✅ อ่านข้อมูล JSON จาก request body
$data = json_decode(file_get_contents("php://input"));

// ตรวจสอบว่ามี banner_id มั้ย
if (!empty($data->banner_id)) {
    $banner->banner_id = $data->banner_id;

    // กำหนดค่าที่จะอัปเดต
    $banner->title = $data->title ?? null;
    $banner->image_url = $data->image_url ?? null;
    $banner->position = $data->position ?? 1;
    $banner->status = $data->status ?? 1;

    if ($banner->update()) {
        http_response_code(200);
        echo json_encode(["message" => "อัปเดตแบนเนอร์เรียบร้อยแล้ว"]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "ไม่สามารถอัปเดตแบนเนอร์ได้"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "ไม่สามารถอัปเดตแบนเนอร์ได้ ต้องระบุ banner_id"]);
}
