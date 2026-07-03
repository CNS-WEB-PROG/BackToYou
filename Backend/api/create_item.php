<?php
require __DIR__ . '/config.php';
require __DIR__ . '/match_items.php';

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

// Request body keys are unchanged from before, so the frontend doesn't
// need to change what it sends — only how we store it changes.
$type            = $data['type']            ?? 'lost';
$category        = trim($data['category']   ?? '');
$title           = trim($data['title']      ?? '');
$description     = trim($data['description'] ?? '');
$location        = trim($data['location']   ?? '');
$location_detail = trim($data['location_detail'] ?? '');
$date_occurred   = $data['date_occurred']   ?? date('Y-m-d');
$time_occurred   = $data['time_occurred']   ?? '';
$item_held_at    = trim($data['item_held_at'] ?? '');
$photo_path      = trim($data['photo_path'] ?? '');

if (!in_array($type, ['lost','found']))  { echo json_encode(['success'=>false,'error'=>'Invalid type.']);        exit; }
if (!$category)                          { echo json_encode(['success'=>false,'error'=>'Category is required.']); exit; }
if (!$title)                             { echo json_encode(['success'=>false,'error'=>'Title is required.']);    exit; }
if (!$description)                       { echo json_encode(['success'=>false,'error'=>'Description is required.']); exit; }
if (!$location)                          { echo json_encode(['success'=>false,'error'=>'Location is required.']); exit; }

// The locked items table has no category / date_occurred / time_occurred /
// location_detail / item_held_at columns. Rather than lose that info,
// fold it into the description text as a metadata tag.
$metaLines = ["Category: $category"];
if ($date_occurred)   $metaLines[] = "Date: $date_occurred";
if ($time_occurred)   $metaLines[] = "Time: $time_occurred";
if ($location_detail) $metaLines[] = "Location detail: $location_detail";
if ($item_held_at)    $metaLines[] = "Currently held at: $item_held_at";

$fullDescription = $description . "\n\n[" . implode(' | ', $metaLines) . "]";

try {
    // Column mapping: type -> item_type, title -> item_name, photo_path -> image
    $stmt = $pdo->prepare("
        INSERT INTO items
            (user_id, item_type, item_name, description, location, image)
        VALUES (?, ?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        $_SESSION['user_id'],
        $type,
        $title,
        $fullDescription,
        $location,
        $photo_path ?: null,
    ]);

    $newItemId = (int) $pdo->lastInsertId();

    $newItem = [
        'id'       => $newItemId,
        'type'     => $type,
        'title'    => $title,
        'location' => $location,
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