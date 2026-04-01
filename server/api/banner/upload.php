<?php
include_once '../../config/init.php';

// 📂 โฟลเดอร์เก็บรูป Banner
$targetDir = "../../image/banner/";

// ถ้าโฟลเดอร์ยังไม่มี → สร้างใหม่
if (!file_exists($targetDir)) {
    mkdir($targetDir, 0777, true);
}

// 🔄 ลบไฟล์เก่า (ถ้ามีส่งมาจาก frontend)
if (!empty($_POST["old_url"])) {
    $oldFilePath = "../../" . ltrim($_POST["old_url"], "/");
    if (file_exists($oldFilePath)) {
        if (!unlink($oldFilePath)) {
            error_log("ลบไฟล์เก่าไม่สำเร็จ: " . $oldFilePath);
        }
    }
}

// 📤 ตรวจสอบว่ามีไฟล์ถูกส่งมา
if (!empty($_FILES["file"]) && $_FILES["file"]["error"] === UPLOAD_ERR_OK) {
    $fileName = time() . "_" . basename($_FILES["file"]["name"]);
    $targetFilePath = $targetDir . $fileName;

    // ย้ายไฟล์ไปยังโฟลเดอร์ banner
    if (move_uploaded_file($_FILES["file"]["tmp_name"], $targetFilePath)) {
        echo json_encode([
            "message" => "อัปโหลดไฟล์สำเร็จ",
            "url" => "/image/banner/" . $fileName
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "ย้ายไฟล์อัปโหลดไม่สำเร็จ"]);
    }
} else {
    // ❌ Debug กรณีอัปโหลดไม่สำเร็จ
    $errorCode = $_FILES["file"]["error"] ?? "ไม่มีไฟล์";
    echo json_encode([
        "message" => "ไม่มีไฟล์ถูกอัปโหลดหรือเกิดข้อผิดพลาดในการอัปโหลด",
        "error_code" => $errorCode,
        "_FILES" => $_FILES,
        "_POST" => $_POST
    ]);
    http_response_code(400);
}
