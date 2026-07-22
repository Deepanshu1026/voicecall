<?php
while (ob_get_level()) {
    ob_end_clean();
}

ob_start();

require_once __DIR__ . '/../../app/helpers/session.php';
require_once __DIR__ . '/../../app/helpers/auth.php';
require_once __DIR__ . '/../../app/helpers/db.php';
require_once __DIR__ . '/../../app/helpers/activity_log.php';

ob_clean();
header('Content-Type: application/json; charset=utf-8');

try {
    require_auth();

    if (!in_array($_SESSION['role'], ['manager', 'admin'])) {
        ob_end_clean();
        die(json_encode(["success" => false, "error" => "Only managers or admins can reject completion"]));
    }

    if (!isset($_POST['case_id']) || !isset($_POST['reason'])) {
        ob_end_clean();
        die(json_encode(["success" => false, "error" => "case_id and reason required"]));
    }

    $caseId = intval($_POST['case_id']);
    $reason = trim($_POST['reason']);
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
    
    if ($_SESSION['role'] === 'manager' && (int)$case['assigned_manager'] !== (int)$userId) {
        ob_end_clean();
        die(json_encode(["success" => false, "error" => "You are not assigned to this case"]));
    }
    
    if ($case['status'] !== 'awaiting-completion-approval') {
        ob_end_clean();
        die(json_encode(["success" => false, "error" => "Case is not awaiting completion approval"]));
    }
    
    // Update status back to in-progress
    $updateStmt = $db->prepare("UPDATE cases SET status = 'in-progress' WHERE id = ?");
    $updateStmt->bind_param("i", $caseId);
    $updateStmt->execute();
    
    // Log activity
    log_case_activity($caseId, $userId, "completion_rejected", [
        "reason" => $reason,
        "rejected_by" => $userId
    ]);
    
    ob_end_clean();
    die(json_encode([
        "success" => true,
        "message" => "Completion rejected. Case returned to in-progress.",
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
