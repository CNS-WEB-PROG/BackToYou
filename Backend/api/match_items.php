<?php
require_once __DIR__ . '/notify.php';

function findAndStoreMatches(array $newItem, PDO $pdo): void {
    $newItemId = (int)$newItem['id'];
    $type      = $newItem['type'];
    $title     = $newItem['title'];

    $oppositeType = ($type === 'lost') ? 'found' : 'lost';

    // No category column in the locked schema, so matching runs on title
    // similarity only, against open items of the opposite type.
    // Change 'title' to 'item_name' and 'type' to 'item_type'
    $stmt = $pdo->prepare("
        SELECT
            i.id,
            i.item_name   AS title,
            i.description,
            i.location,
            i.user_id,
            u.fullname    AS poster_name,
            u.email       AS poster_email,
            MATCH(i.item_name, i.description)
                AGAINST(? IN NATURAL LANGUAGE MODE) AS score
        FROM items i
        JOIN users u ON u.id = i.user_id
        WHERE i.item_type = ?
        AND   i.status    = 'open'
        AND   MATCH(i.item_name, i.description) AGAINST(? IN NATURAL LANGUAGE MODE) > 0
        ORDER BY score DESC
        LIMIT 5
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