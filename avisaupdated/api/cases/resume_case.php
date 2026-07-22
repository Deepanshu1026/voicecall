<?php
while (ob_get_level()) {
    ob_end_clean();
}

ob_start();

require_once __DIR__ . '/../../app/helpers/session.php';
require_once __DIR__ . '/../../app/helpers/auth.php';
require_once __DIR__ . '/../../app/helpers/db.php';
require_once __DIR__ . '/../../app/helpers/activity_log.php';
require_once __DIR__ . '/../../app/models/CaseModel.php';

ob_clean();
header('Content-Type: application/json; charset=utf-8');

try {
    require_auth();

    // ONLY MANAGERS AND ADMINS CAN RESUME CASES
    if (!in_array($_SESSION['role'], ['manager', 'admin'])) {
        ob_end_clean();
        die(json_encode(["success" => false, "error" => "Only managers or admins can resume cases"]));
    }

    if (!isset($_POST['case_id'])) {
        ob_end_clean();
        die(json_encode(["success" => false, "error" => "case_id required"]));
    }

    $caseId = intval($_POST['case_id']);
    $userId = $_SESSION['user_id'];

    $db = db();
    $caseModel = new CaseModel();
    
    $stmt = $db->prepare("SELECT * FROM cases WHERE id = ?");
    $stmt->bind_param("i", $caseId);
    $stmt->execute();
    $case = $stmt->get_result()->fetch_assoc();
    
    if (!$case) {
        ob_end_clean();
        die(json_encode(["success" => false, "error" => "Case not found"]));
    }
    
    // Manager must be assigned to this case
    if ($_SESSION['role'] === 'manager' && (int)$case['assigned_manager'] !== (int)$userId) {
        ob_end_clean();
        die(json_encode(["success" => false, "error" => "You are not assigned to this case"]));
    }
    
    if ($case['status'] !== 'on-hold') {
        ob_end_clean();
        die(json_encode(["success" => false, "error" => "Only on-hold cases can be resumed"]));
    }
    
    // Check if employee already has an active case
    $employeeId = $case['assigned_employee'];
    if ($employeeId && $caseModel->employeeHasActiveCase($employeeId)) {
        ob_end_clean();
        die(json_encode(["success" => false, "error" => "Employee already has an active case. Hold it first before resuming this one."]));
    }
    
    // Update status back to in-progress
    $updateStmt = $db->prepare("UPDATE cases SET status = 'in-progress', updated_at = NOW() WHERE id = ?");
    $updateStmt->bind_param("i", $caseId);
    $updateStmt->execute();
    
    // Log activity
    log_case_activity($caseId, $userId, "case_resumed", [
        "resumed_by" => $userId,
        "role" => $_SESSION['role']
    ]);
    
    ob_end_clean();
    die(json_encode([
        "success" => true,
        "message" => "Case resumed by manager",
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
