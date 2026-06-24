<?php
    require 'config.php';
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (!isset($_FILES['photo'])){
            echo json_encode(['success' => false, 'error' => 'No file uploaded.']);
            exit;
        }

        $file = $_FILES['photo'];

        $allowedTypes = ['image/jpeg', 'image/png', 'image/heic'];
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($file['tmp_name']);

        if (!in_array($mime, $allowedTypes)) {
            echo json_encode(['success' => false, 'error' => 'Only JPG, PNG, and HEIC files are allowed.']);
            exit;
        }
        if ($file['size'] > 10 * 1024 * 1024) {
            echo json_encode(['success' => false, 'error' => 'File exceeds 10 MB limit.']);
            exit;
        }

        $uploadDir = '../uploads/';

        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = time() . '_' . rand(1000, 9999) . '.' . $extension;
        $destination = $uploadDir . $filename;

        if (move_uploaded_file($file['tmp_name'], $destination)) {

            $publicUrl = '/backend/uploads/' . $filename;

            echo json_encode(['success' => true, 'photo_url' => $publicUrl]);
        }else{
            echo json_encode(['success' => false, 'error' => 'Upload failed.']);
        }
    }
?>