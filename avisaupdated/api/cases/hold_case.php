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

    // ONLY MANAGERS AND ADMINS CAN HOLD CASES
    if (!in_array($_SESSION['role'], ['manager', 'admin'])) {
        ob_end_clean();
        die(json_encode(["success" => false, "error" => "Only managers or admins can hold cases"]));
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
    
    // Manager must be assigned to this case
    if ($_SESSION['role'] === 'manager' && (int)$case['assigned_manager'] !== (int)$userId) {
        ob_end_clean();
        die(json_encode(["success" => false, "error" => "You are not assigned to this case"]));
    }
    
    if ($case['status'] !== 'in-progress') {
        ob_end_clean();
        die(json_encode(["success" => false, "error" => "Only in-progress cases can be put on hold"]));
    }
    
    // Update status to on-hold
    $updateStmt = $db->prepare("UPDATE cases SET status = 'on-hold', updated_at = NOW() WHERE id = ?");
    $updateStmt->bind_param("i", $caseId);
    $updateStmt->execute();
    
    // Log activity
    log_case_activity($caseId, $userId, "case_held", [
        "held_by" => $userId,
        "role" => $_SESSION['role']
    ]);
    
    ob_end_clean();
    die(json_encode([
        "success" => true,
        "message" => "Case put on hold by manager",
        "case_id" => $caseId,
        "new_status" => "on-hold"
    ]));
    
} catch (Exception $e) {
    ob_end_clean();
    die(json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]));
}
