<?php
require 'config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        if (!isset($_FILES['photo']) || $_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
            $errorCode = $_FILES['photo']['error'] ?? UPLOAD_ERR_NO_FILE;
            echo json_encode(['success' => false, 'error' => 'No file uploaded or error code: ' . $errorCode]);
            exit;
        }

        $file = $_FILES['photo'];
        $allowedTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/jpg'];
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($file['tmp_name']);

        if (!in_array($mime, $allowedTypes)) {
            echo json_encode(['success' => false, 'error' => 'Only JPG, JPEG, PNG, and HEIC files are allowed.']);
            exit;
        }
        
        if ($file['size'] > 10 * 1024 * 1024) {
            echo json_encode(['success' => false, 'error' => 'File exceeds 10 MB limit.']);
            exit;
        }

        $uploadDir = '../uploads/';
        if (!is_dir($uploadDir)) {
            @mkdir($uploadDir, 0755, true);
        }

        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $filename = time() . '_' . rand(1000, 9999) . '.' . $extension;
        $destination = $uploadDir . $filename;

        if (move_uploaded_file($file['tmp_name'], $destination)) {
            $publicUrl = '/backtoyou/Backend/uploads/' . $filename;
            echo json_encode(['success' => true, 'photo_url' => $publicUrl]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Failed to write uploaded file to filesystem destination directory.']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Server script error: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
}
?>