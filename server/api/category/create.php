<?php
include_once '../../config/init.php';

include_once '../../config/database.php';
include_once '../../models/Category.php';

$database = new Database();
$db = $database->getConnection();

$category = new Category($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->name) && !empty($data->description)) {
    $category->name = $data->name;
    $category->description = $data->description;
    $category->created_at = date('Y-m-d H:i:s');
    $category->updated_at = date('Y-m-d H:i:s');

    if ($category->create()) {
        http_response_code(201); // 201 Created
        echo json_encode(array("message" => "สร้างหมวดหมู่เรียบร้อยแล้ว"));
    } else {
        http_response_code(503); // 503 Service Unavailable
        echo json_encode(array("message" => "ไม่สามารถสร้างหมวดหมู่ได้"));
    }
} else {
    http_response_code(400); // 400 Bad Request
    echo json_encode(array("message" => "ไม่สามารถสร้างหมวดหมู่ได้ ข้อมูลไม่ครบ"));
}
