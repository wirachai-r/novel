<?php
include_once '../../config/init.php';

include_once '../../config/database.php';
include_once '../../models/Follow.php';

$database = new Database();
$db = $database->getConnection();
$follow = new Follow($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->user_id) && !empty($data->novel_id)) {
    $follow->user_id = $data->user_id;
    $follow->novel_id = $data->novel_id;

    if ($follow->unfollow()) {
        http_response_code(200);
        echo json_encode(["message" => "เลิกติดตามนิยายเรียบร้อยแล้ว"]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "ไม่สามารถเลิกติดตามนิยายได้ อาจจะยังไม่ได้ติดตามอยู่"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "ไม่สามารถเลิกติดตามนิยายได้ ข้อมูลไม่ครบ"]);
}
?>
