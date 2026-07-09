<?php
define('BREVO_API_KEY', ' '); 
define('SENDER_EMAIL',  'noreply@backtoyou.com');
define('SENDER_NAME',   'BackToYou');
define('SITE_URL',      'http://localhost/BackToYou/Frontend/pages/browse.html');
define('USE_BREVO',     false); 

function sendMatchNotification(
    string $toEmail,
    string $toName,
    string $yourItemTitle,
    string $matchedItemTitle,
    string $matchedType
): void {
    $subject = "Possible match found for your item — BackToYou";

    $html = "
    <div style='font-family:sans-serif;max-width:480px;margin:0 auto;border:1px solid #eee;padding:20px;border-radius:8px;'>
      <h2 style='color:#1e3a5f;'>📋 BackToYou</h2>
      <p>Hi <strong>" . htmlspecialchars($toName) . "</strong>,</p>
      <p>Good news! Someone posted a <strong>" . htmlspecialchars($matchedType) . " item</strong> that may match your posting: <em>\"" . htmlspecialchars($yourItemTitle) . "\"</em>.</p>
      <p>The matched item is: <em>\"" . htmlspecialchars($matchedItemTitle) . "\"</em>.</p>
      <p style='margin-top:20px;'><a href='" . SITE_URL . "' style='background:#1e3a5f;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:bold;'>View on BackToYou →</a></p>
    </div>";

    $logDir = _DIR_ . '/../../logs';
    if (!is_dir($logDir)) { @mkdir($logDir, 0755, true); }
    $logFile = $logDir . '/mail.log';

    if (!USE_BREVO) {
        file_put_contents($logFile, date('[Y-m-d H:i:s]') . " [MOCK] TO: $toEmail | SUBJ: $subject\n", FILE_APPEND);
        return;
    }

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
        CURLOPT_TIMEOUT        => 10,
        CURLOPT_HTTPHEADER     => [
            'api-key: ' . BREVO_API_KEY,
            'Content-Type: application/json',
        ],
    ]);

    $response = curl_exec($ch);
    if (curl_errno($ch)) {
        error_log("Brevo Mail cURL Error: " . curl_error($ch));
    }
    curl_close($ch);
}
?>