<?php
    require 'config.php';
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (!isset($_FILES['photo'])){
            echo json_encode(['success' => false, 'error' => 'No file uploaded.']);
            exit;
        }

        $file = $_FILES['photo'];
        $uploadDir = '../uploads/';

        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = time() . '_' . rand(1000, 9999) . '.' . $extension;
        $destination = $uploadDir . $filename;

        if (move_uploaded_file($file['tmp_name'], $destination)) {
            echo json_encode(['success' => true, 'photo_url' => '/uploads/' . $filename]);
        }else{
            echo json_encode(['success' => false, 'error' => 'Upload failed.']);
        }
    }
?>