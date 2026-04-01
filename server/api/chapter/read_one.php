<?php
include_once '../../config/init.php';

// ====== Include database & model ======
include_once '../../config/database.php';
include_once '../../models/Chapter.php';

// ====== Initialize ======
$database = new Database();
$db = $database->getConnection();
$chapter = new Chapter($db);

// ====== Validate input ======
if (!isset($_GET['novel_id']) || !isset($_GET['chapter_number'])) {
    http_response_code(400);
    echo json_encode(["message" => "ข้อมูลไม่ครบ ต้องระบุ novel_id และ chapter_number"]);
    exit();
}

$chapter->novel_id = (int)$_GET['novel_id'];
$chapter->chapter_number = (int)$_GET['chapter_number'];

// ====== Read chapter ======
if ($chapter->readOne()) {
    $chapter_arr = [
        "novel_id" => (int)$chapter->novel_id,
        "novel_title" => $chapter->novel_title,
        "chapter_number" => (int)$chapter->chapter_number,
        "title" => $chapter->title,
        "content" => $chapter->content,
        "created_at" => $chapter->created_at,
        "updated_at" => $chapter->updated_at
    ];

    http_response_code(200);
    echo json_encode($chapter_arr);
} else {
    http_response_code(404);
    echo json_encode(["message" => "ไม่พบตอนนิยาย"]);
}
?>
