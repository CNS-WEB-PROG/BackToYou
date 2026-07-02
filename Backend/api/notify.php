<?php
/**
 * BackToYou — notify.php
 *
 * Sends email notifications via Brevo (free — 300 emails/day).
 *
**/
define('BREVO_API_KEY', ' ');
define('SENDER_EMAIL',  'noreply@backtoyou.com');
define('SENDER_NAME',   'BackToYou');
define('SITE_URL',      'http://localhost/backtoyou/Frontend/pages/browse.html');
define('USE_BREVO',     false); // set true once you have a Brevo key

function sendMatchNotification(
    string $toEmail,
    string $toName,
    string $yourItemTitle,
    string $matchedItemTitle,
    string $matchedType   // 'lost' or 'found'
): void {
    $subject = "Possible match found for your item — BackToYou";

    $html = "
    <div style='font-family:sans-serif;max-width:480px;margin:0 auto;'>
      <h2 style='color:#1e3a5f;'>📋 BackToYou</h2>
      <p>Hi <strong>$toName</strong>,</p>
      <p>
        Good news! Someone posted a <strong>$matchedType item</strong> that may match
        your posting: <em>\"$yourItemTitle\"</em>.
      </p>
      <p>
        The matched item is: <em>\"$matchedItemTitle\"</em>.
      </p>
      <p>
        <a href='" . SITE_URL . "'
           style='background:#1e3a5f;color:#fff;padding:10px 20px;
                  border-radius:6px;text-decoration:none;display:inline-block;'>
          View on BackToYou →
        </a>
      </p>
      <p style='color:#888;font-size:0.8rem;margin-top:24px;'>
        You're receiving this because you opted in to match notifications.
      </p>
    </div>
    ";

    if (!USE_BREVO) {
        // Log to file for local testing
        $logDir = __DIR__ . '/../../logs';
        if (!is_dir($logDir)) mkdir($logDir, 0755, true);
        file_put_contents(
            $logDir . '/mail.log',
            date('[Y-m-d H:i:s]') . " TO: $toEmail | SUBJECT: $subject\n",
            FILE_APPEND
        );
        return;
    }

    // Send via Brevo API
    $payload = json_encode([
        'sender'      => ['name' => SENDER_NAME, 'email' => SENDER_EMAIL],
        'to'          => [['email' => $toEmail, 'name' => $toName]],
        'subject'     => $subject,
        'htmlContent' => $html,
    ]);

    $ch = curl_init('https://api.brevo.com/v3/smtp/email');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_HTTPHEADER     => [
            'api-key: ' . BREVO_API_KEY,
            'Content-Type: application/json',
        ],
    ]);
    curl_exec($ch);
    curl_close($ch);
}