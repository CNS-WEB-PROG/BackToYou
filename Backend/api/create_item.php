<?php
    require 'config.php';

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (!isset($_SESSION['user_id'])) {
            echo json_encode(['success' => false, 'error' => 'You must be logged in to post an item.']);
            exit;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        $type = $data['type'] ?? 'lost';
        $category = $data['category'] ?? '';
        $title = $data['title'] ?? '';
        $description = $data['description'] ?? '';
        $location = $data['location'] ?? '';
        $date_occurred = $data['date_occurred'] ?? date('Y-m-d');

        $stmt = $pdo->prepare("
            INSERT INTO items (user_id, type, category, title, description, location, date_occurred)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([$_SESSION['user_id'], $type, $category, $title, $description, $location, $date_occurred]);
    
        echo json_encode(['success' => true, 'message' => 'Item posted!']);
    }
?>