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

    if ($_SESSION['role'] !== 'employee') {
        ob_end_clean();
        die(json_encode(["success" => false, "error" => "Only employees can request reopen"]));
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
    
    if ((int)$case['assigned_employee'] !== (int)$userId) {
        ob_end_clean();
        die(json_encode(["success" => false, "error" => "This case is not assigned to you"]));
    }
    
    if ($case['status'] !== 'completed') {
        ob_end_clean();
        die(json_encode(["success" => false, "error" => "Only completed cases can request reopen. Current status: " . $case['status']]));
    }
    
    // ⭐ IMPORTANT: Change status to reopen-requested so manager can see it
    $updateStmt = $db->prepare("UPDATE cases SET status = 'reopen-requested', updated_at = NOW() WHERE id = ?");
    $updateStmt->bind_param("i", $caseId);
    $result = $updateStmt->execute();
    
    if (!$result) {
        ob_end_clean();
        die(json_encode(["success" => false, "error" => "Failed to update case status"]));
    }
    
    // Log activity
    log_case_activity($caseId, $userId, "reopen_requested", [
        "requested_by" => $userId
    ]);
    
    ob_end_clean();
    die(json_encode([
        "success" => true,
        "message" => "Reopen request sent to manager",
        "case_id" => $caseId,
        "new_status" => "reopen-requested"
    ]));
    
} catch (Exception $e) {
    ob_end_clean();
    die(json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]));
}
