<?php
require 'config.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
    exit;
}

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Login required.']);
    exit;
}

$userId = (int)$_SESSION['user_id'];

try {
    // Get matches where the current user owns either the lost or found item
    $stmt = $pdo->prepare("
        SELECT
            m.id,
            m.score,
            m.created_at,
            lost.id        AS lost_id,
            lost.item_name AS lost_title,
            lost.location  AS lost_location,
            found.id       AS found_id,
            found.item_name AS found_title,
            found.location  AS found_location,
            lu.fullname    AS lost_poster,
            fu.fullname    AS found_poster
        FROM matches m
        JOIN items lost  ON lost.id  = m.lost_item_id
        JOIN items found ON found.id = m.found_item_id
        JOIN users lu    ON lu.id    = lost.user_id
        JOIN users fu    ON fu.id    = found.user_id
        WHERE lost.user_id = ? OR found.user_id = ?
        ORDER BY m.created_at DESC
        LIMIT 20
    ");
    $stmt->execute([$userId, $userId]);
    $matches = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'matches' => $matches]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>