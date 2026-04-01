<?php
include_once '../../config/init.php';

include_once '../../config/database.php';
include_once '../../models/Writer.php';

$data = json_decode(file_get_contents("php://input"));

// ตรวจสอบข้อมูล
if (empty($data->novel_id) || !isset($data->status)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "รหัสนิยายหรือสถานะหายไป"
    ]);
    exit();
}

$database = new Database();
$db = $database->getConnection();
$writer = new Writer($db);

$writer->novel_id = $data->novel_id;
$writer->status = $data->status;

// อัปเดตสถานะนิยาย
if ($writer->updateStatus()) {
    echo json_encode([
        "success" => true,
        "message" => "อัปเดตสถานะนิยายเรียบร้อยแล้ว"
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "ไม่สามารถอัปเดตสถานะนิยายได้"
    ]);
}
?>
