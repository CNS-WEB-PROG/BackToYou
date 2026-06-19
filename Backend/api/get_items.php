<?php
    require 'config.php';

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {

        $stmt = $pdo->prepare("
            SELECT  items.*, users.name as poster_name
            FROM items
            JOIN users ON items.user_id = users.id
            ORDER BY created_at DESC
        ");
        $stmt->execute();
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'items' => $items]);
    }
?>