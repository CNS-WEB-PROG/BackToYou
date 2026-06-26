<?php
    require 'config.php';

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        $name       = $data['name'] ?? '';
        $student_id = $data['student_id'] ?? '';
        $email      = $data['email'] ?? '';
        $password   = $data['password'] ?? '';
        $phone      = $data['phone'] ?? '';

        $hashed_password = password_hash($password, PASSWORD_DEFAULT);

        $check = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $check->execute([$email]);
        if ($check->fetch()) {
            echo json_encode(["success" => false, "error" => "Email already registered."]);
            exit;
        }

        if (!$name || !$email || !$password) {
            echo json_encode(["success" => false, "error" => "All fields are required."]);
            exit;
        }

        $sql = "INSERT INTO users (name, student_id, email, password, phone) VALUES (?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);

        try {
            $stmt->execute([$name, $student_id, $email, $hashed_password, $phone]);

            echo json_encode(["success" => true, "message" => "Account created!"]);
        }catch (Exception $e) {
            echo json_encode(["success" => false, "error" => "Registration Failed."]);
        }
    }
?>