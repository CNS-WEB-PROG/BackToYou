<?php
require 'config.php';
require 'match_items.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
    exit;
}

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'You must be logged in to post an item.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$type            = $data['type']            ?? 'lost';
$category        = trim($data['category']   ?? '');
$title           = trim($data['title']      ?? '');
$description     = trim($data['description'] ?? '');
$location        = trim($data['location']   ?? '');
$location_detail = trim($data['location_detail'] ?? '');
$date_occurred   = $data['date_occurred']   ?? date('Y-m-d');
$time_occurred   = $data['time_occurred']   ?? null;
$item_held_at    = trim($data['item_held_at'] ?? '');
$photo_path      = trim($data['photo_path'] ?? '');
$notify_email    = isset($data['notify_email']) ? (int)$data['notify_email'] : 1;

if (!in_array($type, ['lost','found']))  { echo json_encode(['success'=>false,'error'=>'Invalid type.']);        exit; }
if (!$category)                          { echo json_encode(['success'=>false,'error'=>'Category is required.']); exit; }
if (!$title)                             { echo json_encode(['success'=>false,'error'=>'Title is required.']);    exit; }
if (!$description)                       { echo json_encode(['success'=>false,'error'=>'Description is required.']); exit; }
if (!$location)                          { echo json_encode(['success'=>false,'error'=>'Location is required.']); exit; }

try {
    $stmt = $pdo->prepare("
        INSERT INTO items
            (user_id, type, category, title, description,
             location, location_detail, date_occurred, time_occurred,
             item_held_at, photo_path, notify_email)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        $_SESSION['user_id'],
        $type,
        $category,
        $title,
        $description,
        $location,
        $location_detail ?: null,
        $date_occurred,
        $time_occurred   ?: null,
        $item_held_at    ?: null,
        $photo_path      ?: null,
        $notify_email,
    ]);

    $newItemId = (int) $pdo->lastInsertId();

    $newItem = [
        'id'          => $newItemId,
        'type'        => $type,
        'category'    => $category,
        'title'       => $title,
        'description' => $description,
        'location'    => $location,
    ];

    try {
        findAndStoreMatches($newItem, $pdo);
    } catch (Exception $matchError) {
        error_log("Matching engine error for item ID $newItemId: " . $matchError->getMessage());
    }

    echo json_encode(['success' => true, 'message' => 'Item posted!', 'id' => $newItemId]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database save failed: ' . $e->getMessage()]);
}
?>