<?php
include_once '../../config/init.php';

require_once '../../vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

include_once '../../config/database.php';
include_once '../../models/User.php';

// secret key
$secret_key = "novel_secret_key";

// ✅ ดึง Authorization header
$headers = apache_request_headers();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(["message" => "Token not provided"]);
    exit;
}

$jwt = $matches[1];

try {
    // ✅ decode token
    $decoded = JWT::decode($jwt, new Key($secret_key, 'HS256'));

    // ✅ ดึงข้อมูลจาก token
    $user_id = $decoded->data->user_id ?? null;

    if (!$user_id) {
        throw new Exception("Invalid token payload");
    }

    // ✅ หา user ใน DB
    $database = new Database();
    $db = $database->getConnection();
    $user = new User($db);
    $user->user_id = $user_id;
    $user->readOne();

    if (!$user->status || $user->status != 1) {
        http_response_code(403);
        echo json_encode(["message" => "บัญชีถูกระงับ"]);
        exit;
    }

    // ✅ ส่งข้อมูล user กลับ
    echo json_encode([
        "valid" => true,
        "user" => [
            "user_id" => (int)$user->user_id,
            "display_name" => $user->display_name,
            "email" => $user->email,
            "role" => $user->role,
            "status" => $user->status
        ]
    ]);
    exit;

} catch (Exception $e) {
    http_response_code(401);
    echo json_encode([
        "valid" => false,
        "message" => "Invalid token",
        "error" => $e->getMessage()
    ]);
    exit;
}