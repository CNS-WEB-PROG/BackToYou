<?php
require 'config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->prepare("
            SELECT items.*, users.name as poster_name
            FROM items
            LEFT JOIN users ON items.user_id = users.id
            ORDER BY items.created_at DESC
        ");
        $stmt->execute();
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'items' => $items]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database query failed: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
}
?>