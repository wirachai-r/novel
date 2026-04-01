<?php
include_once '../../config/init.php';

include_once '../../config/database.php';
include_once '../../models/Category.php';

$database = new Database();
$db = $database->getConnection();
$category = new Category($db);

// อ่าน JSON body
$data = json_decode(file_get_contents("php://input"));

// ตรวจสอบ category_id
if (!empty($data->category_id)) {
    $category->category_id = $data->category_id;

    try {
        if ($category->delete()) {
            http_response_code(200);
            echo json_encode(["message" => "ลบหมวดหมู่เรียบร้อยแล้ว"]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "ไม่สามารถลบหมวดหมู่ได้"]);
        }
    } catch (PDOException $e) {
        http_response_code(503);
        echo json_encode(["message" => "เกิดข้อผิดพลาดฐานข้อมูล: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "ต้องระบุ category_id"]);
}
