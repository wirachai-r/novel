<?php
include_once '../../config/init.php';

include_once '../../config/database.php';
include_once '../../models/Chapter.php';

$database = new Database();
$db = $database->getConnection();

$chapter = new Chapter($db);

$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->novel_id) &&
    !empty($data->chapter_number) &&
    !empty($data->title) &&
    isset($data->content)
) {
    $chapter->novel_id = $data->novel_id;
    $chapter->chapter_number = $data->chapter_number;
    $chapter->title = $data->title;
    $chapter->content = $data->content;

    if ($chapter->update()) {
        http_response_code(200);
        echo json_encode(["message" => "แก้ไขตอนนิยายเรียบร้อยแล้ว"]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "ไม่สามารถแก้ไขตอนนิยายได้"]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        "message" => "ไม่สามารถแก้ไขตอนนิยายได้ ข้อมูลไม่ครบ ต้องระบุ: novel_id, chapter_number, title, content"
    ]);
}
?>
