<?php
session_start();

$host = 'localhost';
$dbname = 'backtoyou';
$username = 'root';
$password = 'mariadb';   // Change this only if your MySQL password is different

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password
    );

    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Connected to BackToYou database successfully!";
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}
?>