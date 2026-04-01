<?php
include_once '../../config/init.php';

include_once '../../config/database.php';
include_once '../../models/Banner.php';

$database = new Database();
$db = $database->getConnection();

$banner = new Banner($db);

// รับค่า page และ limit
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
$offset = ($page - 1) * $limit;

// อ่านข้อมูล
$stmt = $banner->read($limit, $offset);
$num = $stmt->rowCount();

// อ่าน total record
$totalStmt = $banner->countAll();
$totalRecords = (int)$totalStmt->fetchColumn();
$totalPages = ($limit > 0) ? ceil($totalRecords / $limit) : 1;

$banners_arr = [
    "records" => [],
    "page" => $page,
    "pageSize" => $limit,
    "totalRecords" => $totalRecords,
    "totalPages" => $totalPages
];

if ($num > 0) {
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);
        $banner_item = [
            "banner_id" => $banner_id,
            "title" => $title,
            "image_url" => $image_url,
            "position" => $position,
            "status" => $status,
        ];
        $banners_arr["records"][] = $banner_item;
    }
}

http_response_code(200);
echo json_encode($banners_arr);
