<?php
include_once '../../config/init.php';

include_once '../../config/database.php';
include_once '../../models/Comment.php';

$database = new Database();
$db = $database->getConnection();
$comment = new Comment($db);

// รับ novel_id
$novel_id = isset($_GET['novel_id']) ? (int)$_GET['novel_id'] : 0;
if ($novel_id <= 0) {
    http_response_code(400);
    echo json_encode(["message" => "ต้องระบุ novel_id", "records" => []]);
    exit;
}

// set ค่าให้ model
$comment->novel_id = $novel_id;
$comment->chapter_number = isset($_GET['chapter_number']) ? $_GET['chapter_number'] : null;

$stmt = $comment->read();
$num = $stmt->rowCount();

$response = [
    "records" => [],
    "message" => ""
];

if ($num > 0) {
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $response["records"][] = [
            "comment_id" => $row['comment_id'],
            "user_id" => $row['user_id'],
            "display_name" => $row['display_name'],
            "content" => $row['content'],
            "created_at" => $row['created_at']
        ];
    }
    $response["message"] = "ดึงความคิดเห็นเรียบร้อยแล้ว";
} else {
    $response["message"] = "ไม่พบความคิดเห็น";
}

http_response_code(200);
echo json_encode($response);
?>
