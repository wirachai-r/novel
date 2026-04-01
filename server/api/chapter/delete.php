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
    !empty($data->chapter_number)
) {
    $chapter->novel_id = $data->novel_id;
    $chapter->chapter_number = $data->chapter_number;

    if ($chapter->delete()) {
        http_response_code(200);
        echo json_encode(["message" => "ลบตอนนิยายเรียบร้อยแล้ว"]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "ไม่สามารถลบตอนนิยายได้ อาจไม่มีตอนนี้อยู่ในระบบ"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "ไม่สามารถลบตอนนิยายได้ ข้อมูลไม่ครบ ต้องระบุ novel_id และ chapter_number"]);
}
?>
