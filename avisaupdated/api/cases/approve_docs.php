<?php
// Clean all output buffers first
while (ob_get_level()) {
    ob_end_clean();
}

// Start fresh buffer
ob_start();

require_once __DIR__ . '/../../app/helpers/session.php';
require_once __DIR__ . '/../../app/helpers/auth.php';
require_once __DIR__ . '/../../app/helpers/db.php';
require_once __DIR__ . '/../../app/helpers/activity_log.php';

// Clear any output from includes
ob_clean();

// Set header
header('Content-Type: application/json; charset=utf-8');

try {
    require_auth();

    if (!in_array($_SESSION['role'], ['manager', 'admin'])) {
        ob_end_clean();
        die(json_encode(["success" => false, "error" => "Only managers or admins can approve documents"]));
    }

    if (!isset($_POST['case_id'])) {
        ob_end_clean();
        die(json_encode(["success" => false, "error" => "case_id required"]));
    }

    $caseId = intval($_POST['case_id']);
    $userId = $_SESSION['user_id'];

    $db = db();
    
    $stmt = $db->prepare("SELECT * FROM cases WHERE id = ?");
    $stmt->bind_param("i", $caseId);
    $stmt->execute();
    $case = $stmt->get_result()->fetch_assoc();
    
    if (!$case) {
        ob_end_clean();
        die(json_encode(["success" => false, "error" => "Case not found"]));
    }
    
    // Check if manager is assigned to this case
    if ($_SESSION['role'] === 'manager' && (int)$case['assigned_manager'] !== (int)$userId) {
        ob_end_clean();
        die(json_encode(["success" => false, "error" => "You are not assigned to this case"]));
    }
    
    // Check status
    if ($case['status'] !== 'waiting-doc-approval') {
        ob_end_clean();
        die(json_encode(["success" => false, "error" => "Case is not waiting for document approval"]));
    }
    
    // Update status to in-progress
    $updateStmt = $db->prepare("UPDATE cases SET status = 'in-progress' WHERE id = ?");
    $updateStmt->bind_param("i", $caseId);
    $updateStmt->execute();
    
    // Log activity
    log_case_activity($caseId, $userId, "docs_approved", [
        "approved_by" => $userId
    ]);
    
    ob_end_clean();
    die(json_encode([
        "success" => true,
        "message" => "Documents approved successfully",
        "case_id" => $caseId,
        "new_status" => "in-progress"
    ]));
    
} catch (Exception $e) {
    ob_end_clean();
    die(json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]));
}
