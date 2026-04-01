<?php
include_once '../../config/init.php';

include_once '../../config/database.php';
include_once '../../models/User.php';

$database = new Database();
$db = $database->getConnection();

$user = new User($db);

$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
$offset = ($page - 1) * $limit;

$stmt = $user->read($limit, $offset);
$num = $stmt->rowCount();

$totalRecords = $user->countAll(); // จำนวน record ทั้งหมด
$totalPages = ceil($totalRecords / $limit);

// เตรียม array สำหรับ response
$users_arr = [];
$users_arr["records"] = [];
$users_arr["page"] = $page;
$users_arr["pageSize"] = $limit;
$users_arr["totalRecords"] = (int)$totalRecords;
$users_arr["totalPages"] = (int)$totalPages;

if ($num > 0) {
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);
        $user_item = [
            "user_id" => $user_id,
            "firstname" => $firstname,
            "lastname" => $lastname,
            "email" => $email,
            "display_name" => $display_name,
            "role" => $role,
            "status" => $status,
            "created_at" => $created_at
        ];
        array_push($users_arr["records"], $user_item);
    }
}

// **ส่ง JSON ออกมาเพียงครั้งเดียว**
http_response_code(200);
echo json_encode($users_arr);
exit(); // ป้องกัน output เพิ่มเติม
