<?php
require 'config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        // Schema note: users.fullname (not "name"), and there is no
        // student_id column in the locked schema, so it is accepted from
        // the request but intentionally not stored.
        $fullname = trim($data['name'] ?? '');
        $email    = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';
        $phone    = trim($data['phone'] ?? '');

        if (empty($fullname) || empty($email) || empty($password)) {
            echo json_encode(["success" => false, "error" => "Name, email, and password fields are required."]);
            exit;
        }

        $check = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $check->execute([$email]);
        if ($check->fetch()) {
            echo json_encode(["success" => false, "error" => "Email already registered."]);
            exit;
        }

        $hashed_password = password_hash($password, PASSWORD_DEFAULT);

        $sql = "INSERT INTO users (fullname, email, password, phone) VALUES (?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $fullname,
            $email,
            $hashed_password,
            $phone ?: null
        ]);

        echo json_encode(["success" => true, "message" => "Account created!"]);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Registration Failed due to system error: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Method not allowed."]);
}
?>