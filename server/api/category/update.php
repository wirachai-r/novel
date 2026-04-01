<?php
include_once '../../config/init.php';

include_once '../../config/database.php';
include_once '../../models/Category.php';

$database = new Database();
$db = $database->getConnection();

$category = new Category($db);

$data = json_decode(file_get_contents("php://input"));

$category->category_id = $data->category_id;

// กำหนดค่าของ category
$category->name = $data->name;
$category->description = $data->description;
$category->updated_at = date('Y-m-d H:i:s');

// อัปเดต category
if ($category->update()) {
    http_response_code(200); // 200 OK
    echo json_encode(array("message" => "อัปเดตหมวดหมู่เรียบร้อยแล้ว"));
} else {
    http_response_code(503); // 503 Service Unavailable
    echo json_encode(array("message" => "ไม่สามารถอัปเดตหมวดหมู่นี้ได้"));
}
?>
