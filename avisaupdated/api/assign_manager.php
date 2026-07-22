<?php
require_once __DIR__ . '/../app/helpers/session.php';
require_once __DIR__ . '/../app/helpers/auth.php';
require_once __DIR__ . '/../app/helpers/db.php';
require_once __DIR__ . '/../app/helpers/activity_log.php';

require_auth();

if (!isset($_POST['case_id']) || !isset($_POST['manager_id'])) {
    echo json_encode(["error" => "case_id and manager_id required"]);
    exit;
}

$caseId = intval($_POST['case_id']);
$managerId = intval($_POST['manager_id']);

try {
    $db = db();
    
    // Check if employee is already assigned
    $checkStmt = $db->prepare("SELECT assigned_employee FROM cases WHERE id = ?");
    $checkStmt->bind_param("i", $caseId);
    $checkStmt->execute();
    $result = $checkStmt->get_result();
    $caseData = $result->fetch_assoc();

    if ($caseData && $caseData['assigned_employee']) {
        echo json_encode(["error" => "Cannot change manager - employee already assigned to this case"]);
        exit;
    }
    
    // Update case with manager
    $stmt = $db->prepare("UPDATE cases SET assigned_manager = ?, status = 'assigned' WHERE id = ?");
    $stmt->bind_param("ii", $managerId, $caseId);
    $stmt->execute();
    
    // Get manager name
    $nameStmt = $db->prepare("SELECT name FROM users WHERE id = ?");
    $nameStmt->bind_param("i", $managerId);
    $nameStmt->execute();
    $nameResult = $nameStmt->get_result();
    $managerData = $nameResult->fetch_assoc();
    
    // Log activity
    log_case_activity($caseId, $_SESSION['user_id'], "assigned_manager", [
        "manager_id" => $managerId,
        "manager_name" => $managerData['name']
    ]);
    
    echo json_encode([
        "success" => true,
        "message" => "Manager assigned successfully",
        "manager_name" => $managerData['name']
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "error" => "Failed to assign manager",
        "message" => $e->getMessage()
    ]);
}

