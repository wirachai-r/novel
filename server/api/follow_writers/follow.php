<?php
include_once '../../config/init.php';
include_once '../../config/database.php';
include_once '../../models/Follow_writers.php'; // ใช้ model นักเขียน

$database = new Database();
$db = $database->getConnection();
$followWriter = new FollowWriters($db);

$data = json_decode(file_get_contents("php://input"));

// ตรวจสอบ user_id และ writer_id
if (!empty($data->user_id) && !empty($data->writer_id)) {
    $followWriter->user_id = $data->user_id;
    $followWriter->writer_id = $data->writer_id;

    if ($followWriter->follow()) {
        http_response_code(201); // Created
        echo json_encode(["message" => "ติดตามนักเขียนเรียบร้อยแล้ว"]);
    } else {
        http_response_code(503); // Service Unavailable
        echo json_encode(["message" => "ไม่สามารถติดตามนักเขียนได้ อาจติดตามไปแล้ว"]);
    }
} else {
    http_response_code(400); // Bad Request
    echo json_encode(["message" => "ไม่สามารถติดตามนักเขียนได้ ข้อมูลไม่ครบ"]);
}
?>
