<?php
include_once '../../config/init.php';

// ====== Database and Model ======
include_once '../../config/database.php';
include_once '../../models/Comment.php';

$database = new Database();
$db = $database->getConnection();

$comment = new Comment($db);

// ====== Read JSON input ======
$input = file_get_contents("php://input");
$data = json_decode($input);

if (!$data) {
    http_response_code(400);
    echo json_encode([
        "message" => "ไม่ได้รับ JSON หรือ JSON ไม่ถูกต้อง",
        "raw_input" => $input
    ]);
    exit();
}

// ====== Validate required fields ======
if (!empty($data->user_id) && !empty($data->novel_id) && isset($data->content)) {
    $comment->user_id = $data->user_id;
    $comment->novel_id = $data->novel_id;
    $comment->content = $data->content;
    $comment->chapter_number = $data->chapter_number ?? null;
    $comment->parent_comment_id = $data->parent_comment_id ?? null;

    if ($comment->create()) {
        http_response_code(201);
        echo json_encode(["message" => "สร้างความคิดเห็นเรียบร้อยแล้ว"]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "ไม่สามารถสร้างความคิดเห็นได้"]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        "message" => "ไม่สามารถสร้างความคิดเห็นได้ ข้อมูลไม่ครบ ต้องระบุ: user_id, novel_id, content",
        "received" => $data
    ]);
}
?>
