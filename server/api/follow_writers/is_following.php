<?php
include_once '../../config/init.php';
include_once '../../config/database.php';
include_once '../../models/Follow_writers.php'; // เปลี่ยนเป็น model นักเขียน

$database = new Database();
$db = $database->getConnection();
$followWriter = new FollowWriters($db);

if (!empty($_GET['user_id']) && !empty($_GET['writer_id'])) {
    $followWriter->user_id = (int)$_GET['user_id'];
    $followWriter->writer_id = (int)$_GET['writer_id'];

    $isFollowing = $followWriter->isFollowing();
    http_response_code(200);
    echo json_encode(["is_following" => $isFollowing]);
} else {
    http_response_code(400);
    echo json_encode(["message" => "ต้องระบุ user_id และ writer_id"]);
}
?>
