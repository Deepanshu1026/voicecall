<?php
require_once __DIR__ . '/../../app/helpers/auth.php';
require_once __DIR__ . '/../../app/helpers/db2.php';

require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$current_user_id = $_SESSION['user_id'];
$sender_id = $_POST['sender_id'] ?? null;

if (!$sender_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing sender_id']);
    exit;
}

header('Content-Type: application/json');

try {
    $db2 = db2();
    // Mark messages sent BY the other user TO the current user as read
    $stmt = $db2->prepare("UPDATE messages SET is_read = 'yes', status = 'Read' WHERE sender_id = ? AND receiver_id = ? AND is_read = 'no'");
    $stmt->bind_param("ii", $sender_id, $current_user_id);
    $stmt->execute();
    
    echo json_encode(['success' => true, 'affected' => $stmt->affected_rows]);
    
    $stmt->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
