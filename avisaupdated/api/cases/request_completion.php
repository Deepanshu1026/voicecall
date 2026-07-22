<?php
require_once __DIR__ . '/../../app/helpers/session.php';
require_once __DIR__ . '/../../app/helpers/auth.php';
require_once __DIR__ . '/../../app/helpers/db.php';
require_once __DIR__ . '/../../app/helpers/activity_log.php';

// Start output buffering to catch any accidental output
ob_start();

require_auth();

// Clear any buffered output
ob_end_clean();

// Set JSON header
header('Content-Type: application/json; charset=utf-8');

if ($_SESSION['role'] !== 'employee') {
    echo json_encode(["success" => false, "error" => "Only employees can request completion"]);
    exit;
}

if (!isset($_POST['case_id'])) {
    echo json_encode(["success" => false, "error" => "case_id required"]);
    exit;
}

$caseId = intval($_POST['case_id']);
$userId = $_SESSION['user_id'];

try {
    $db = db();
    
    // Get case
    $stmt = $db->prepare("SELECT * FROM cases WHERE id = ?");
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $db->error);
    }
    
    $stmt->bind_param("i", $caseId);
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    $case = $stmt->get_result()->fetch_assoc();
    
    if (!$case) {
        echo json_encode(["success" => false, "error" => "Case not found"]);
        exit;
    }
    
    // Verify ownership
    if ((int)$case['assigned_employee'] !== (int)$userId) {
        echo json_encode(["success" => false, "error" => "This case is not assigned to you"]);
        exit;
    }
    
    // Check status - only from in-progress
    if ($case['status'] !== 'in-progress') {
        echo json_encode(["success" => false, "error" => "Case must be in progress. Current status: " . $case['status']]);
        exit;
    }
    
    // Update status
    $updateStmt = $db->prepare("UPDATE cases SET status = 'awaiting-completion-approval' WHERE id = ?");
    if (!$updateStmt) {
        throw new Exception("Prepare failed: " . $db->error);
    }
    
    $updateStmt->bind_param("i", $caseId);
    if (!$updateStmt->execute()) {
        throw new Exception("Update failed: " . $updateStmt->error);
    }
    
    // Log activity
    log_case_activity($caseId, $userId, "case_completion_requested", [
        "employee_id" => $userId
    ]);
    
    // Return success
    echo json_encode([
        "success" => true,
        "message" => "Completion request submitted successfully",
        "case_id" => $caseId,
        "new_status" => "awaiting-completion-approval"
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "error" => "Failed to request completion",
        "message" => $e->getMessage()
    ]);
}
?>