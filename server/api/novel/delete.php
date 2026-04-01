<?php
include_once '../../config/init.php';

// include database & model
include_once '../../config/database.php';
include_once '../../models/Novel.php';

// สร้าง connection
$database = new Database();
$db = $database->getConnection();
$novel = new Novel($db);

// รับข้อมูล JSON
$data = json_decode(file_get_contents("php://input"));

// ตรวจสอบว่ามี novel_id
if (!empty($data->data->novel_id)) {  // ปรับตาม structure { data: { novel_id } }
    $novel->novel_id = $data->data->novel_id;

    // อ่านข้อมูลนิยายก่อนลบ เพื่อดึงชื่อไฟล์ cover
    $oldNovel = $novel->readOne(true);
    
    // ตรวจสอบ cover image
    $coverFile = null;
    if (!empty($oldNovel['cover_image_url'])) {
        $fileName = basename(parse_url($oldNovel['cover_image_url'], PHP_URL_PATH));
        $coverFile = __DIR__ . "/../../image/novel/" . $fileName;
    }

    if ($novel->delete()) {
        if ($coverFile && file_exists($coverFile)) {
            unlink($coverFile);
        }
        http_response_code(200);
        echo json_encode(["message" => "ลบนิยายและภาพปกเรียบร้อยแล้ว"]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "ไม่สามารถลบนิยายได้ อาจเป็นเพราะนิยายไม่มีอยู่ในระบบ"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "ไม่สามารถลบนิยายได้ ข้อมูลไม่ครบ ต้องระบุ novel_id"]);
}
