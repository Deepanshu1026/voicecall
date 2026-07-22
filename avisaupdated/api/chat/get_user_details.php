<?php
require_once __DIR__ . '/../../app/helpers/auth.php';
require_once __DIR__ . '/../../app/helpers/db.php';
require_once __DIR__ . '/../../app/helpers/db2.php';

require_auth();

$target_id = $_GET['user_id'] ?? null;
if (!$target_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing user_id']);
    exit;
}

header('Content-Type: application/json');

try {
    $db2 = db2();
    $userData = null;
    
    // 1. Try DB2 users table
    // Adjust fields based on what's available. Assuming standard fields from AdminController view earlier.
    // In AdminController: user_name, user_email, user_mobile, user_current_status, created_at, role?
    // In AuthController: name, role, status, password (db1 users) 
    // Wait, DB2 users (clients) schema might differ.
    // In get_conversations: user_name, user_role.
    
    $stmt = $db2->prepare("SELECT id, user_name as name, user_email as email, user_mobile as phone, user_role as role, user_current_status as status, user_profile, created_at FROM users WHERE id = ?");
    $stmt->bind_param("i", $target_id);
    $stmt->execute();
    $res = $stmt->get_result();
    
    if ($row = $res->fetch_assoc()) {
        $userData = $row;
        $userData['source'] = 'client';
    } else {
        // 2. Try DB1 calling_team (Agents)
        $db1 = db();
        $stmt = $db1->prepare("SELECT id, user_name as name, user_email as email, user_mobile as phone, 'agent' as role, user_status as status, created_at FROM calling_team WHERE id = ?");
        $stmt->bind_param("i", $target_id);
        $stmt->execute();
        $res = $stmt->get_result();
        
        if ($row = $res->fetch_assoc()) {
            $userData = $row;
            $userData['source'] = 'agent';
        }
    }
    
    if ($userData) {
        echo json_encode(['success' => true, 'user' => $userData]);
    } else {
        echo json_encode(['success' => false, 'error' => 'User not found']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
