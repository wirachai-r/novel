<?php
include_once '../../config/init.php';

include_once '../../config/database.php';
include_once '../../models/Novel.php';

$database = new Database();
$db = $database->getConnection();

$novel = new Novel($db);

$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
$offset = ($page - 1) * $limit;

// เรียกเมธอด novelUpdate (เรียงตาม updated_at ล่าสุด)
$stmt = $novel->novelUpdate($limit, $offset);
$num = $stmt->rowCount();

if ($num > 0) {
    $novel_arr = array();
    $novel_arr["records"] = array();

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);

        $novel_item = array(
            "novel_id" => $novel_id,
            "user_id" => $user_id,
            "title" => $title,
            "author_name" => $author_name,
            "translator_name" => $translator_name,
            "description" => $description,
            "cover_image_url" => $cover_image_url,
            "status" => $status,
            "view_count" => $view_count,
            "chapter_count" => $chapter_count, // บทที่ไม่นับ draft
            "created_at" => $created_at,
            "updated_at" => $updated_at
        );
        array_push($novel_arr["records"], $novel_item);
    }

    http_response_code(200);
    echo json_encode($novel_arr);
} else {
    http_response_code(404);
    echo json_encode(array("message" => "ไม่พบข้อมูลนิยาย"));
}
?>
