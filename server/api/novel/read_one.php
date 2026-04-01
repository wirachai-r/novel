<?php
include_once '../../config/init.php';

include_once '../../config/database.php';
include_once '../../models/Novel.php';

$database = new Database();
$db = $database->getConnection();

$novel = new Novel($db);

if (!isset($_GET['novel_id'])) {
    http_response_code(400);
    echo json_encode(["message" => "คำขอไม่ถูกต้อง novel_id หายไป"]);
    exit();
}

$novel_id = $_GET['novel_id'];
$novel->novel_id = $novel_id;

// ถ้ามี user_id ส่งมาด้วย จะเช็คว่า user กดไลค์หรือยัง
$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;

$novel_data = $novel->readOne(true);

if ($novel_data) {
    // --- นับจำนวนไลค์ทั้งหมด ---
    $likeQuery = "SELECT COUNT(*) as like_count FROM likes WHERE novel_id = :novel_id";
    $likeStmt = $db->prepare($likeQuery);
    $likeStmt->bindParam(":novel_id", $novel_id, PDO::PARAM_INT);
    $likeStmt->execute();
    $like_count = (int)$likeStmt->fetch(PDO::FETCH_ASSOC)['like_count'];
    $novel_data['like_count'] = $like_count;

    // --- ตรวจสอบว่า user กดไลค์หรือยัง ---
    $novel_data['is_liked'] = false;
    if ($user_id) {
        $checkQuery = "SELECT 1 FROM likes WHERE novel_id = :novel_id AND user_id = :user_id LIMIT 1";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(":novel_id", $novel_id, PDO::PARAM_INT);
        $checkStmt->bindParam(":user_id", $user_id, PDO::PARAM_INT);
        $checkStmt->execute();
        $novel_data['is_liked'] = $checkStmt->rowCount() > 0;
    }

    http_response_code(200);
    echo json_encode($novel_data);
} else {
    http_response_code(404);
    echo json_encode(["message" => "ไม่พบนิยาย"]);
}
