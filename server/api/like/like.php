<?php
include_once '../../config/init.php';

include_once '../../config/database.php';
include_once '../../models/Like.php'; // เรียก Like model

$database = new Database();
$db = $database->getConnection();
$like = new Like($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->user_id) && !empty($data->novel_id)) {
    $like->user_id = $data->user_id;
    $like->novel_id = $data->novel_id;

    if ($like->like()) {
        http_response_code(201); // Created
        echo json_encode(["message" => "กดถูกใจนิยายเรียบร้อยแล้ว"]);
    } else {
        http_response_code(503); // Service Unavailable
        echo json_encode(["message" => "ไม่สามารถกดถูกใจนิยายได้ อาจเคยกดถูกใจแล้ว"]);
    }
} else {
    http_response_code(400); // Bad Request
    echo json_encode(["message" => "ไม่สามารถกดถูกใจนิยายได้ ข้อมูลไม่ครบ"]);
}
?>
