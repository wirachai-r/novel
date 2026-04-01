<?php
include_once '../../config/init.php';

require_once '../../config/init.php';
include_once '../../config/database.php';
include_once '../../models/Banner.php';

$database = new Database();
$db = $database->getConnection();
$banner = new Banner($db);

$data = json_decode(file_get_contents("php://input"));

// ตรวจสอบ banner_id
if (!empty($data->banner_id)) {  // ปรับตาม structure { banner_id }
    $banner->banner_id = $data->banner_id;

    if ($banner->readOne()) {
        $imagePath = null;
        if (!empty($banner->image_url)) {
            $imagePath = __DIR__ . "/../../" . ltrim($banner->image_url, "/");
        }

        try {
            if ($banner->delete()) {
                if ($imagePath && file_exists($imagePath)) {
                    @unlink($imagePath);
                }

                http_response_code(200);
                echo json_encode(["message" => "ลบแบนเนอร์และรูปภาพสำเร็จ"]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "ไม่สามารถลบแบนเนอร์ได้"]);
            }
        } catch (PDOException $e) {
            if ($e->getCode() == '23000') {
                http_response_code(409);
                echo json_encode([
                    "message" => "ไม่สามารถลบแบนเนอร์ได้ เนื่องจากมีการใช้งานอยู่ในส่วนอื่น"
                ]);
            } else {
                http_response_code(503);
                echo json_encode([
                    "message" => "ข้อผิดพลาดจากฐานข้อมูล: " . $e->getMessage()
                ]);
            }
        }
    } else {
        http_response_code(404);
        echo json_encode(["message" => "ไม่พบแบนเนอร์"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "ต้องระบุ banner_id"]);
}
