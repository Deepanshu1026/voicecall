<?php
require_once __DIR__ . '/../../app/helpers/session.php';
require_once __DIR__ . '/../../app/helpers/auth.php';
require_once __DIR__ . '/../../app/helpers/db.php';
require_once __DIR__ . '/../../app/helpers/activity_log.php';

require_auth();

if ($_SESSION['role'] !== 'employee') {
    echo json_encode(["success" => false, "error" => "Only employees can mark documents complete"]);
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
    $stmt->bind_param("i", $caseId);
    $stmt->execute();
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
    
    // Check status
    if ($case['status'] !== 'in-progress') {
        echo json_encode(["success" => false, "error" => "Case must be in progress"]);
        exit;
    }
    
    // Update status
    $updateStmt = $db->prepare("UPDATE cases SET status = 'waiting-doc-approval' WHERE id = ?");
    $updateStmt->bind_param("i", $caseId);
    $updateStmt->execute();
    
    // Log activity
    log_case_activity($caseId, $userId, "docs_marked_complete", []);
    
    echo json_encode([
        "success" => true,
        "message" => "Documents marked complete",
        "case_id" => $caseId,
        "new_status" => "waiting-doc-approval"
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "error" => "Failed to mark documents complete",
        "message" => $e->getMessage()
    ]);
}
