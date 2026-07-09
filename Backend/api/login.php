<?php
require 'config.php';

header('Content-Type: application/json');

// dashboard.html's logout link POSTs { _method: 'DELETE' } to this same
// endpoint instead of hitting a separate logout.php.
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (($data['_method'] ?? '') === 'DELETE') {
        $_SESSION = [];
        session_destroy();
        echo json_encode(['success' => true, 'message' => 'Logged out.']);
        exit;
    }
}

try {
    $stmt = $pdo->query("
        SELECT
            items.id, items.item_type AS type, items.item_name AS title,
            items.description, items.location, items.image, items.status,
            items.created_at, items.user_id, users.fullname AS poster_name,
            users.email AS poster_email
        FROM items
        JOIN users ON users.id = items.user_id
        ORDER BY items.created_at DESC
    ");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // create_item.php packs category/date_occurred/time_occurred/
    // location_detail/item_held_at into the description as a trailing
    // "[Category: X | Date: Y | ...]" tag, since the locked schema has no
    // columns for them. Unpack that tag back into real fields here.
    $items = array_map(function ($row) {
        $description     = $row['description'];
        $category        = 'Other';
        $date_occurred   = date('Y-m-d', strtotime($row['created_at']));
        $location_detail = '';

        if (preg_match('/\[(.*)\]\s*$/s', $description, $m)) {
            $description = trim(str_replace('[' . $m[1] . ']', '', $description));
            foreach (explode('|', $m[1]) as $part) {
                $kv = array_map('trim', explode(':', $part, 2));
                if (count($kv) < 2) continue;
                [$key, $value] = $kv;
                if ($key === 'Category')         $category = $value;
                if ($key === 'Date')             $date_occurred = $value;
                if ($key === 'Location detail')  $location_detail = $value;
            }
        }

        return [
            'id'              => (int)$row['id'],
            'type'            => $row['type'],
            'title'           => $row['title'],
            'description'     => $description,
            'category'        => $category,
            'location'        => $row['location'],
            'location_detail' => $location_detail,
            'date_occurred'   => $date_occurred,
            'image'           => $row['image'],
            'status'          => $row['status'],
            'created_at'      => $row['created_at'],
            'poster_name'     => $row['poster_name'],
            'poster_email'    => $row['poster_email'],
        ];
    }, $rows);

    echo json_encode(['success' => true, 'items' => $items]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Could not load items: ' . $e->getMessage()]);
}
?>