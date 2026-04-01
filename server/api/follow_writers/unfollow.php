<?php
include_once '../../config/init.php';
include_once '../../config/database.php';
include_once '../../models/Follow_writers.php'; // ใช้ model นักเขียน

$database = new Database();
$db = $database->getConnection();
$followWriter = new FollowWriters($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->user_id) && !empty($data->writer_id)) {
    $followWriter->user_id = $data->user_id;
    $followWriter->writer_id = $data->writer_id;

    if ($followWriter->unfollow()) {
        http_response_code(200);
        echo json_encode(["message" => "เลิกติดตามนักเขียนเรียบร้อยแล้ว"]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "ไม่สามารถเลิกติดตามนักเขียนได้ อาจจะยังไม่ได้ติดตามอยู่"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "ไม่สามารถเลิกติดตามนักเขียนได้ ข้อมูลไม่ครบ"]);
}
?>
