<?php
require_once __DIR__ . '/notify.php';

function findAndStoreMatches(array $newItem, PDO $pdo): void {
    $newItemId = (int)$newItem['id'];
    $type      = $newItem['type'];
    $title     = $newItem['title'];

    $oppositeType = ($type === 'lost') ? 'found' : 'lost';

    // No category column in the locked schema, so matching runs on title
    // similarity only, against open items of the opposite type.
    $stmt = $pdo->prepare("
        SELECT id, user_id, item_name
        FROM items
        WHERE item_type = ?
          AND status = 'open'
          AND id != ?
    ");
    $stmt->execute([$oppositeType, $newItemId]);
    $potentialMatches = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (!$potentialMatches) {
        return;
    }

    // No matches table in the locked schema, so a possible match is
    // recorded as a row in notifications instead of a scored match record.
    $notifyStmt = $pdo->prepare("
        INSERT INTO notifications (user_id, message)
        VALUES (?, ?)
    ");

    foreach ($potentialMatches as $match) {
        $matchUserId = (int)$match['user_id'];
        $matchTitle  = $match['item_name'];

        $titleScore = 0;
        if (stripos($title, $matchTitle) !== false || stripos($matchTitle, $title) !== false) {
            $titleScore = 80;
        }

        $finalScore = $titleScore + 20;

        if ($finalScore >= 50) {
            $message = "Possible match: someone posted a \"$title\" ($type) that may relate to your \"$matchTitle\" posting.";
            $notifyStmt->execute([$matchUserId, $message]);

            $userStmt = $pdo->prepare("SELECT fullname, email FROM users WHERE id = ?");
            $userStmt->execute([$matchUserId]);
            $matchedUser = $userStmt->fetch(PDO::FETCH_ASSOC);

            if ($matchedUser) {
                sendMatchNotification(
                    $matchedUser['email'],
                    $matchedUser['fullname'],
                    $matchTitle,
                    $title,
                    $type
                );
            }
        }
    }
}
?>