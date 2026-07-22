<?php
require_once __DIR__ . '/../../app/helpers/session.php';
require_once __DIR__ . '/../../app/helpers/auth.php';
require_once __DIR__ . '/../../app/helpers/db.php';

// Prevent caching
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
header('Content-Type: application/json; charset=utf-8');

require_auth();

if (!in_array($_SESSION['role'], ['manager', 'admin'])) {
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

$userId = $_SESSION['user_id'];
$role = $_SESSION['role'];

try {
    $db = db();
    
    if ($role === 'manager') {
        // Added reopen-request (singular) just in case
        $stmt = $db->prepare("
            SELECT c.*, 
                   u_mgr.name as manager_name, 
                   u_emp.name as employee_name
            FROM cases c
            LEFT JOIN users u_mgr ON u_mgr.id = c.assigned_manager
            LEFT JOIN users u_emp ON u_emp.id = c.assigned_employee
            WHERE c.status IN ('waiting-doc-approval', 'awaiting-completion-approval', 'reopen-requested', 'on-hold')
              AND c.assigned_manager = ?
            ORDER BY c.updated_at DESC
        ");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    } else {
        // admin - see all pending
        $query = "
            SELECT c.*, 
                   u_mgr.name as manager_name, 
                   u_emp.name as employee_name
            FROM cases c
            LEFT JOIN users u_mgr ON u_mgr.id = c.assigned_manager
            LEFT JOIN users u_emp ON u_emp.id = c.assigned_employee
            WHERE c.status IN ('waiting-doc-approval', 'awaiting-completion-approval', 'reopen-requested', 'on-hold')
            ORDER BY c.updated_at DESC
        ";
        $result = $db->query($query)->fetch_all(MYSQLI_ASSOC);
    }
    
    echo json_encode([
        "success" => true,
        "cases" => $result,
        "debug_info" => [
            "user_id" => $userId,
            "role" => $role,
            "count" => count($result)
        ]
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
