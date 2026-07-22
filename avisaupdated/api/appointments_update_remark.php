<?php
// api/appointments_update_remark.php

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'error' => 'Unauthorized access']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$id = $input['id'] ?? null;
$remark = $input['remark'] ?? '';

if (!$id) {
    echo json_encode(['success' => false, 'error' => 'Appointment ID is required']);
    exit;
}

$dbConfig = require __DIR__ . '/../config/database2.php';
$conn = new mysqli($dbConfig['host'], $dbConfig['user'], $dbConfig['pass'], $dbConfig['name']);

if ($conn->connect_error) {
    echo json_encode(['success' => false, 'error' => 'Connection failed: ' . $conn->connect_error]);
    exit;
}

$stmt = $conn->prepare("UPDATE appointments SET admin_remark = ? WHERE id = ?");
$stmt->bind_param("si", $remark, $id);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => $stmt->error]);
}

$stmt->close();
$conn->close();
