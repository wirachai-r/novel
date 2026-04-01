<?php
include_once '../../config/init.php';

include_once '../../config/database.php';
include_once '../../models/Category.php';

$database = new Database();
$db = $database->getConnection();

$category = new Category($db);

$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
$offset = ($page - 1) * $limit;

// อ่านข้อมูล
$stmt = $category->read($limit, $offset);
$num = $stmt->rowCount();

// อ่าน total record
$totalStmt = $category->countAll();
$totalRecords = (int)$totalStmt->fetchColumn();
$totalPages = ($limit > 0) ? ceil($totalRecords / $limit) : 1;

$categories_arr = [
    "records" => [],
    "page" => $page,
    "pageSize" => $limit,
    "totalRecords" => $totalRecords,
    "totalPages" => $totalPages
];

if ($num > 0) {
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);
        $category_item = [
            "category_id" => $category_id,
            "name" => $name,
            "description" => html_entity_decode($description),
        ];
        $categories_arr["records"][] = $category_item;
    }
}

http_response_code(200);
echo json_encode($categories_arr);
