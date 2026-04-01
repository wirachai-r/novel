<?php
include_once '../../config/init.php';

include_once '../../config/database.php';
include_once '../../models/Follow.php';

$database = new Database();
$db = $database->getConnection();
$follow = new Follow($db);

if (!empty($_GET['user_id']) && !empty($_GET['novel_id'])) {
    $follow->user_id = (int)$_GET['user_id'];
    $follow->novel_id = (int)$_GET['novel_id'];

    $isFollowing = $follow->isFollowing();
    http_response_code(200);
    echo json_encode(["is_following" => $isFollowing]);
} else {
    http_response_code(400);
    echo json_encode(["message" => "ต้องระบุ user_id และ novel_id"]);
}
?>
