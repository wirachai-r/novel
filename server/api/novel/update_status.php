<?php
include_once '../../config/init.php';

include_once '../../config/database.php';
include_once '../../models/Novel.php';

$data = json_decode(file_get_contents("php://input"));

if (empty($data->novel_id) || !isset($data->status)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Novel ID or status missing"]);
    exit();
}

$database = new Database();
$db = $database->getConnection();
$novel = new Novel($db);

$novel->novel_id = $data->novel_id;
$novel->status = $data->status;

if ($novel->updateStatus()) {
    echo json_encode(["success" => true, "message" => "อัปเดตสถานะนิยายแล้ว"]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "อัปเดตสถานะนิยายไม่สำเร็จ"]);
}
