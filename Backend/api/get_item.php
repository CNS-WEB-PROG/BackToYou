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

$id = (int)($_GET['id'] ?? 0);

if (!$id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Item ID is required.']);
    exit;
}

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
            u.fullname    AS poster_name,
            u.email       AS poster_email
        FROM items i
        JOIN users u ON u.id = i.user_id
        WHERE i.id = ?
        LIMIT 1
    ");
    $stmt->execute([$id]);
    $item = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$item) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Item not found.']);
        exit;
    }

    // Show contact details to any logged-in user
    if (!isset($_SESSION['user_id'])) {
        unset($item['poster_email']);
    }

    echo json_encode(['success' => true, 'item' => $item]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>