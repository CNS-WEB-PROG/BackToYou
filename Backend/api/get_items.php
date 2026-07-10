<?php
require 'config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

// dashboard.html's logout link POSTs { _method: 'DELETE' } to this same
// endpoint instead of hitting a separate logout.php.
if (($data['_method'] ?? '') === 'DELETE') {
    $_SESSION = [];
    session_destroy();
    echo json_encode(['success' => true, 'message' => 'Logged out.']);
    exit;
}

try {
    $email = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';

    if (empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'error' => 'Email and password fields are required.']);
        exit;
    }

    // Schema note: users.fullname (not "name")
    $stmt = $pdo->prepare("SELECT id, fullname, password FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = (int)$user['id'];
        $_SESSION['user_name'] = $user['fullname'];

        echo json_encode([
            'success' => true,
            'message' => 'Logged in!',
            'name' => $user['fullname']
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Invalid email or password.']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Login system failure: ' . $e->getMessage()]);
}
?>