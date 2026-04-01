<?php
include_once '../../config/init.php';

include_once '../../config/database.php';
include_once '../../models/Chapter.php';

$database = new Database();
$db = $database->getConnection();

$chapter = new Chapter($db);

$chapter->novel_id = isset($_GET['novel_id']) ? (int)$_GET['novel_id'] : 0;

if ($chapter->novel_id <= 0) {
    http_response_code(400); // Bad Request
    echo json_encode(["message" => "ไม่สามารถอ่านตอนนิยายได้ ต้องระบุ novel_id"]);
    return;
}

$stmt = $chapter->readByNovelId();
$num = $stmt->rowCount();

if ($num > 0) {
    $chapters_arr = [];
    $chapters_arr["records"] = [];

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);

        $chapter_item = [
            "novel_id" => $novel_id,
            "chapter_number" => $chapter_number,
            "title" => $title,
            "created_at" => $created_at,
            "updated_at" => $updated_at
        ];
        array_push($chapters_arr["records"], $chapter_item);
    }

    http_response_code(200);
    echo json_encode($chapters_arr);
}
// else {
//     http_response_code(404);
//     echo json_encode(["message" => "ไม่พบตอนสำหรับนิยายเรื่องนี้"]);
// }
?>
