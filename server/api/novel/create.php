<?php
include_once '../../config/init.php';

include_once '../../config/database.php';
include_once '../../models/Novel.php';

$database = new Database();
$db = $database->getConnection();

$novel = new Novel($db);

$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->user_id) &&
    !empty($data->title) &&
    !empty($data->description) &&
    !empty($data->status) &&
    isset($data->categories) && is_array($data->categories)
) {
    $novel->user_id = $data->user_id;
    $novel->title = $data->title;
    $novel->description = $data->description;
    $novel->status = $data->status;

    $novel->author_name = !empty($data->author_name) ? $data->author_name : null;
    $novel->translator_name = !empty($data->translator_name) ? $data->translator_name : null;
    $novel->cover_image_url = !empty($data->cover_image_url) ? $data->cover_image_url : null;
    $novel->view_count = isset($data->view_count) ? $data->view_count : 0;

    $novel->categories = $data->categories;

    // เรียกใช้ฟังก์ชัน create() เพื่อบันทึกข้อมูล
    if ($novel->create()) {
        http_response_code(201); // 201 Created
        echo json_encode(array(
            "message" => "สร้างนิยายเรียบร้อยแล้ว",
            "novel_id" => $novel->novel_id // ส่ง novel_id ที่เพิ่งสร้างกลับไปด้วย
        ));
    } else {
        http_response_code(503); // 503 Service Unavailable
        echo json_encode(array("message" => "ไม่สามารถสร้างนิยายได้"));
    }
} else {
    // ถ้าข้อมูลที่ส่งมาไม่ครบ
    http_response_code(400); // 400 Bad Request
    echo json_encode(array("message" => "ไม่สามารถสร้างนิยายได้ ข้อมูลไม่ครบ กรุณาใส่ user_id, title, description, status และ categories (ในรูปแบบ array)"));
}
?>
