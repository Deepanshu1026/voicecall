<?php
require_once __DIR__ . '/../app/helpers/session.php';
require_once __DIR__ . '/../app/helpers/auth.php';
require_once __DIR__ . '/../app/helpers/db.php';
require_once __DIR__ . '/../app/helpers/activity_log.php';

require_auth();

if (!isset($_POST['case_id']) || !isset($_POST['employee_id'])) {
    echo json_encode(["error" => "case_id and employee_id required"]);
    exit;
}

$caseId = intval($_POST['case_id']);
$employeeId = intval($_POST['employee_id']);

try {
    $db = db();
    
    // Update case with employee
    $stmt = $db->prepare("UPDATE cases SET assigned_employee = ?, status = 'assigned' WHERE id = ?");
    $stmt->bind_param("ii", $employeeId, $caseId);
    $stmt->execute();
    
    // Get employee name
    $nameStmt = $db->prepare("SELECT name FROM users WHERE id = ?");
    $nameStmt->bind_param("i", $employeeId);
    $nameStmt->execute();
    $nameResult = $nameStmt->get_result();
    $employeeData = $nameResult->fetch_assoc();
    
    // Log activity
    log_case_activity($caseId, $_SESSION['user_id'], "assigned_employee", [
        "employee_id" => $employeeId,
        "employee_name" => $employeeData['name']
    ]);
    
    echo json_encode([
        "success" => true,
        "message" => "Employee assigned successfully",
        "employee_name" => $employeeData['name']
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "error" => "Failed to assign employee",
        "message" => $e->getMessage()
    ]);
}
