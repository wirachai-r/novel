<?php
include_once '../../config/init.php';
// ====== Database & Model ======
include_once '../../config/database.php';
include_once '../../models/Comment.php';

$database = new Database();
$db = $database->getConnection();
$comment = new Comment($db);

// อ่าน JSON body
$data = json_decode(file_get_contents("php://input"));

// ตรวจสอบ comment_id
if (!empty($data->comment_id)) {
    $comment->comment_id = $data->comment_id;
    if ($comment->delete()) {
        http_response_code(200);
        echo json_encode(["message" => "ลบความคิดเห็นเรียบร้อยแล้ว"]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "ไม่สามารถลบความคิดเห็นได้"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "ต้องระบุ comment_id"]);
}
?>
