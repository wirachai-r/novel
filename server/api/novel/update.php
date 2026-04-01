<?php
include_once '../../config/init.php';

// include database & model
include_once '../../config/database.php';
include_once '../../models/Novel.php';

$database = new Database();
$db = $database->getConnection();
$novel = new Novel($db);

$data = json_decode(file_get_contents("php://input"));

// ตรวจสอบข้อมูลครบ
if (
    !empty($data->novel_id) &&
    !empty($data->title) &&
    !empty($data->description) &&
    !empty($data->status) &&
    isset($data->categories) &&
    is_array($data->categories)
) {
    // โหลดข้อมูลเก่ามาก่อน
    $novel->novel_id = $data->novel_id;
    $oldNovel = $novel->readOne(true);

    // ถ้ามี cover เดิม และส่งมาใหม่ → ลบไฟล์เก่า
    if (
        $oldNovel && !empty($oldNovel['cover_image_url'])
        && $oldNovel['cover_image_url'] !== $data->cover_image_url
    ) {

        // ดึงชื่อไฟล์จาก URL
        $fileName = basename(parse_url($oldNovel['cover_image_url'], PHP_URL_PATH));
        // path จริงบน server
        $oldFile = __DIR__ . "/../../image/novel/" . $fileName;

        if (file_exists($oldFile)) {
            unlink($oldFile);
        }
    }

    // เซ็ตค่าที่ต้องการอัปเดต
    $novel->title = $data->title;
    $novel->author_name = $data->author_name ?? null;
    $novel->translator_name = $data->translator_name ?? null;
    $novel->description = $data->description;
    $novel->cover_image_url = $data->cover_image_url;
    $novel->status = $data->status;
    $novel->categories = $data->categories;

    if ($novel->update()) {
        http_response_code(200);
        echo json_encode(["message" => "อัปเดตนิยายแล้ว"]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "อัปเดตนิยายไม่ได้"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "อัปเดตนิยายไม่ได้ ข้อมูลไม่สมบูรณ์"]);
}
