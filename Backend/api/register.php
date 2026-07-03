<?php
require 'config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        $name       = trim($data['name'] ?? '');
        $student_id = trim($data['student_id'] ?? '');
        $email      = trim($data['email'] ?? '');
        $password   = $data['password'] ?? '';
        $phone      = trim($data['phone'] ?? '');

        if (empty($name) || empty($email) || empty($password)) {
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

        $sql = "INSERT INTO users (name, student_id, email, password, phone) VALUES (?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $name, 
            $student_id ?: null, 
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