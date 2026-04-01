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

    if ($follow->follow()) {
        http_response_code(201); // Created
        echo json_encode(["message" => "ติดตามนิยายเรียบร้อยแล้ว"]);
    } else {
        http_response_code(503); // Service Unavailable
        echo json_encode(["message" => "ไม่สามารถติดตามนิยายได้ อาจติดตามไปแล้ว"]);
    }
} else {
    http_response_code(400); // Bad Request
    echo json_encode(["message" => "ไม่สามารถติดตามนิยายได้ ข้อมูลไม่ครบ"]);
}
?>
