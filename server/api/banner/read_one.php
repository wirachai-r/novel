<?php
include_once '../../config/init.php';

include_once '../../config/database.php';
include_once '../../models/Banner.php';

$database = new Database();
$db = $database->getConnection();

$banner = new Banner($db);

// ✅ รับค่า banner_id จาก GET
$banner_id = isset($_GET['banner_id']) ? intval($_GET['banner_id']) : 0;

if ($banner_id > 0) {
    $banner->banner_id = $banner_id;

    if ($banner->readOne()) {
        // ✅ พบข้อมูล
        $banner_arr = [
            "banner_id" => $banner->banner_id,
            "title" => $banner->title,
            "image_url" => $banner->image_url,
            "position" => $banner->position,
            "status" => $banner->status,
        ];

        http_response_code(200);
        echo json_encode($banner_arr);
    } else {
        // ❌ ไม่พบข้อมูล
        http_response_code(404);
        echo json_encode(["message" => "ไม่พบแบนเนอร์"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "คำขอไม่ถูกต้อง ต้องระบุ banner_id"]);
}
