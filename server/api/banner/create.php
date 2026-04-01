<?php
include_once '../../config/init.php';

include_once '../../config/database.php';
include_once '../../models/Banner.php';

$database = new Database();
$db = $database->getConnection();

$banner = new Banner($db);

$data = json_decode(file_get_contents("php://input"));

// debug
error_log("Received Banner Data: " . print_r($data, true));

if (!empty($data->image_url)) {
    $banner->title = $data->title ?? "ไม่มีชื่อเรื่อง";
    $banner->image_url = $data->image_url;
    $banner->position = $data->position ?? 1;
    $banner->status = $data->status ?? 1;

    if ($banner->create()) {
        http_response_code(201);
        echo json_encode(array("message" => "สร้างแบนเนอร์สำเร็จ"));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "ไม่สามารถสร้างแบนเนอร์ได้"));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "ไม่สามารถสร้างแบนเนอร์ได้ ต้องระบุลิงก์รูปภาพ"));
}
