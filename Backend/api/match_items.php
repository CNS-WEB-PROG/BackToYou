<?php
require_once __DIR__ . '/notify.php';

function findAndStoreMatches(array $newItem, PDO $pdo): void {
    $newItemId   = (int)$newItem['id'];
    $type        = $newItem['type'];
    $category    = $newItem['category'];
    $title       = $newItem['title'];
    $location    = $newItem['location'];

    $oppositeType = ($type === 'lost') ? 'found' : 'lost';

    $stmt = $pdo->prepare("
        SELECT id, user_id, title, notify_email 
        FROM items 
        WHERE type = ? 
          AND category = ? 
          AND status = 'active'
          AND id != ?
    ");
    $stmt->execute([$oppositeType, $category, $newItemId]);
    $potentialMatches = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (!$potentialMatches) {
        return;
    }

    $insertStmt = $pdo->prepare("
        INSERT INTO matches (item_lost_id, item_found_id, match_score) 
        VALUES (?, ?, ?)
    ");

    foreach ($potentialMatches as $match) {
        $matchItemId = (int)$match['id'];
        $matchUserId = (int)$match['user_id'];
        
        $titleScore = 0;
        if (stripos($title, $match['title']) !== false || stripos($match['title'], $title) !== false) {
            $titleScore = 80;
        }

        $finalScore = $titleScore + 20; 

        if ($finalScore >= 50) {
            $lostId  = ($type === 'lost') ? $newItemId : $matchItemId;
            $foundId = ($type === 'found') ? $newItemId : $matchItemId;

            $insertStmt->execute([$lostId, $foundId, $finalScore]);

            if ((int)$match['notify_email'] === 1) {
                $userStmt = $pdo->prepare("SELECT name, email FROM users WHERE id = ?");
                $userStmt->execute([$matchUserId]);
                $matchedUser = $userStmt->fetch(PDO::FETCH_ASSOC);

                if ($matchedUser) {
                    sendMatchNotification(
                        $matchedUser['email'],
                        $matchedUser['name'],
                        $match['title'],
                        $title,
                        $type
                    );
                }
            }
        }
    }
}
?>