<?php
include_once '../../config/init.php';

include_once '../../config/database.php';
include_once '../../models/Comment.php';

$database = new Database();
$db = $database->getConnection();

$comment = new Comment($db);

$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->comment_id) &&
    isset($data->content)
) {
    $comment->comment_id = $data->comment_id;
    $comment->content = $data->content;

    if ($comment->update()) {
        http_response_code(200);
        echo json_encode(["message" => "Comment was updated."]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Unable to update comment. It might not exist."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Unable to update comment. Data is incomplete. Required fields: comment_id, content."]);
}
?>