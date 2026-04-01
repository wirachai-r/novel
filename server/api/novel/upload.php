<?php
include_once '../../config/init.php';

// กำหนดโฟลเดอร์เก็บรูป
$targetDir = "../../image/novel/";

// ถ้าโฟลเดอร์ยังไม่มี ให้สร้างขึ้นมา
if (!file_exists($targetDir)) {
    mkdir($targetDir, 0777, true);
}

// ลบไฟล์เก่า (ถ้ามีส่งมาจาก frontend)
if (!empty($_POST["old_url"])) {
    $oldFilePath = "../../" . ltrim($_POST["old_url"], "/");
    if (file_exists($oldFilePath)) {
        if (!unlink($oldFilePath)) {
            error_log("ไม่สามารถลบไฟล์เก่าได้: " . $oldFilePath);
        }
    }
}

// ตรวจสอบว่ามีไฟล์ส่งมาจริง
if (!empty($_FILES["file"]) && $_FILES["file"]["error"] === UPLOAD_ERR_OK) {
    $fileName = time() . "_" . basename($_FILES["file"]["name"]);
    $targetFilePath = $targetDir . $fileName;

    if (move_uploaded_file($_FILES["file"]["tmp_name"], $targetFilePath)) {
        echo json_encode([
            "message" => "อัปโหลดสำเร็จ",
            "url" => "/image/novel/" . $fileName
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "ไม่สามารถย้ายไฟล์ที่อัปโหลดได้"]);
    }
} else {
    // Debug: แสดง error ถ้าไม่มีไฟล์หรือเกิดปัญหา
    $errorCode = $_FILES["file"]["error"] ?? "ไม่มีคีย์ไฟล์";
    echo json_encode([
        "message" => "ไม่มีไฟล์ถูกอัปโหลดหรือเกิดข้อผิดพลาดในการอัปโหลด",
        "error_code" => $errorCode,
        "_FILES" => $_FILES,
        "_POST" => $_POST
    ]);
    http_response_code(400);
}
