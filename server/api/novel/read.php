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

// อ่านนิยายตาม pagination
$stmt = $novel->read($limit, $offset);
$num = $stmt->rowCount();

// นับจำนวนทั้งหมด
$stmtTotal = $novel->countAll();
$totalRecords = $stmtTotal->fetchColumn();
$totalPages = ceil($totalRecords / $limit);

if ($num > 0) {
    $novel_arr = array();
    $novel_arr["records"] = array();
    $novel_arr["totalRecords"] = (int)$totalRecords;
    $novel_arr["totalPages"] = (int)$totalPages;
    $novel_arr["message"] = $num > 0 ? "ดึงข้อมูลนิยายสำเร็จแล้ว" : "ไม่พบนิยาย";

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $novel_arr["records"][] = [
            "novel_id" => $row['novel_id'],
            "user_id" => $row['user_id'],
            "title" => $row['title'],
            "translator_name" => $row['translator_name'],
            "description" => $row['description'],
            "cover_image_url" => $row['cover_image_url'],
            "status" => $row['status'],
            "view_count" => (int)$row['view_count'],
            "chapter_count" => (int)$row['chapter_count'],
            "display_name" => $row['display_name'],
            "created_at" => $row['created_at'],
            "updated_at" => $row['updated_at']
        ];
    }

    http_response_code(200);
    echo json_encode($novel_arr);
} else {
    $novel_arr = array(
        "records" => [],
        "totalRecords" => (int)$totalRecords,
        "totalPages" => (int)$totalPages,
        "message" => "ไม่พบนิยาย"
    );
    http_response_code(200);
    echo json_encode($novel_arr);
}
