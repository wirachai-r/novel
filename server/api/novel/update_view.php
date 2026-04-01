<?php
include_once '../../config/init.php';

// แก้ path ให้ถูกต้อง
include_once '../../config/database.php';
include_once '../../models/Novel.php';

// เชื่อมต่อฐานข้อมูล
$database = new Database();
$db = $database->getConnection();

// สร้าง object Novel
$novel = new Novel($db);

// รับค่า novel_id จาก body
$data = json_decode(file_get_contents("php://input"));
$novel->novel_id = isset($data->novel_id) ? $data->novel_id : null;

if ($novel->novel_id) {
    // เรียก updateView
    if ($novel->updateView()) {
        http_response_code(200);
        echo json_encode(["message" => "อัปเดตจำนวนการดูเรียบร้อยแล้ว"]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "ไม่สามารถอัปเดตจำนวนการดูได้"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "novel_id is required."]);
}
