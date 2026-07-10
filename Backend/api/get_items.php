<?php
require 'config.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
    exit;
}

$conditions = ["i.status != 'resolved'"];
$params     = [];

if (!empty($_GET['type'])) {
    $conditions[] = 'i.item_type = ?';
    $params[]     = $_GET['type'];
}
if (!empty($_GET['q'])) {
    $conditions[] = '(i.item_name LIKE ? OR i.description LIKE ?)';
    $q = '%' . $_GET['q'] . '%';
    $params[] = $q;
    $params[] = $q;
}
if (!empty($_GET['location'])) {
    $conditions[] = 'i.location LIKE ?';
    $params[]     = '%' . $_GET['location'] . '%';
}

$where = 'WHERE ' . implode(' AND ', $conditions);
$sort  = ($_GET['sort'] ?? 'newest') === 'oldest'
    ? 'i.created_at ASC'
    : 'i.created_at DESC';

try {
    $stmt = $pdo->prepare("
        SELECT
            i.id,
            i.user_id,
            i.item_type   AS type,
            i.item_name   AS title,
            i.description,
            i.location,
            i.image       AS photo_path,
            i.status,
            i.created_at,
            u.fullname    AS poster_name
        FROM items i
        JOIN users u ON u.id = i.user_id
        $where
        ORDER BY $sort
        LIMIT 100
    ");
    $stmt->execute($params);
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'items' => $items]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>