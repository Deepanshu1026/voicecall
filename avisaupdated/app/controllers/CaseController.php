<?php
// app/controllers/CaseController.php
require_once __DIR__ . '/../models/CaseModel.php';
require_once __DIR__ . '/../helpers/status.php';
require_once __DIR__ . '/../helpers/activity.php';
require_once __DIR__ . '/../helpers/firebase.php';

require_once __DIR__ . '/../models/User.php'; // to validate users/roles

class CaseController
{

    public function createCase($data)
    {
        if (!isset($_SESSION['role']) || !in_array($_SESSION['role'], ['admin', 'manager'])) {
            return ["error" => "Unauthorized"];
        }

        if (empty($data['client_name']) || empty($data['client_phone']) || empty($data['case_type'])) {
            return ["error" => "Missing required fields"];
        }

        $caseModel = new CaseModel();

        // If 'agent_id' is provided, use it as 'created_by'
        $creator = !empty($data['agent_id']) ? $data['agent_id'] : $_SESSION['user_id'];

        $caseId = $caseModel->create([
            "client_name"   => $data['client_name'],
            "client_phone"  => $data['client_phone'],
            "case_type"     => $data['case_type'],
            "created_by"    => $creator,
            "priority"      => $data['priority'] ?? 'normal',
            "remarks"       => $data['remarks'] ?? '',
            "agent_name"    => null // Explicitly clear/ignore agent_name since we use created_by
        ]);

        // Emit SSE Event removed

        // Emit SSE Event removed

        return [
            "success" => true,
            "case_id" => $caseId
        ];
    }

    public function getCases()
    {
        if (!isset($_SESSION['role'])) {
            return ["error" => "Unauthorized"];
        }

        $model = new CaseModel();
        $cases = $model->listCasesByRole($_SESSION['role'], $_SESSION['user_id']);

        return [
            "success" => true,
            "cases" => $cases
        ];
    }

    // ---------------- ASSIGNMENT ----------------

    public function assignManager($caseId, $managerId)
    {
        // Only admin can assign a manager
        if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
            return ["error" => "Forbidden"];
        }

        $caseModel = new CaseModel();
        $userModel = new User();

        $case = $caseModel->findById($caseId);
        if (!$case) return ["error" => "Case not found"];

        if ($case['status'] === 'completed') return ["error" => "Case already completed"];

        $manager = $userModel->findById((int)$managerId);
        if (!$manager || $manager['role'] !== 'manager' || $manager['status'] !== 'active') {
            return ["error" => "Manager not found or not active"];
        }

        $ok = $caseModel->assignManager((int)$caseId, (int)$managerId);
        if (!$ok) return ["error" => "Failed to assign manager"];

        return ["success" => true, "case_id" => $caseId, "assigned_manager" => $managerId];
    }

    public function assignEmployee($caseId, $employeeId)
    {
        if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'manager') {
            return ["error" => "Only managers can assign employees"];
        }

        $caseModel = new CaseModel();
        $userModel = new User();

        // Get case
        $case = $caseModel->findById($caseId);
        if (!$case) return ["error" => "Case not found"];

        // Only assigned manager can assign
        if ((int)$case['assigned_manager'] !== (int)$_SESSION['user_id']) {
            return ["error" => "You are not the assigned manager for this case"];
        }

        // Case completed? cannot assign
        if ($case['status'] === 'completed') {
            return ["error" => "Case already completed"];
        }

        // Validate employee
        $employee = $userModel->findById($employeeId);
        if (!$employee || $employee['role'] !== 'employee' || $employee['status'] !== 'active') {
            return ["error" => "Employee not found or inactive"];
        }

        // Check workload
        $openCases = $caseModel->countOpenCasesForEmployee($employeeId);
        if ($openCases > 0) {
            return ["error" => "Employee already has one open case"];
        }

        // Assign employee
        $caseModel->assignEmployee($caseId, $employeeId);

        // Emit SSE Event removed

        return [
            "success" => true,
            "case_id" => $caseId,
            "employee_id" => $employeeId
        ];
    }
    public function getEmployeeCases($employeeId)
    {
        $caseModel = new CaseModel();
        $cases = $caseModel->getByEmployee($employeeId);

        return [
            "success" => true,
            "cases" => $cases
        ];
    }
    public function updateStatus($caseId, $newStatus)
    {
        $employeeId = $_SESSION['user_id'];

        $caseModel = new CaseModel();
        $case = $caseModel->findById($caseId);

        if (!$case) return ["error" => "Case not found"];

        // Employee must own this case
        if ((int)$case['assigned_employee'] !== (int)$employeeId) {
            return ["error" => "This case is not assigned to you"];
        }

        // Completed case cannot be updated unless reopen-request
        if ($case['status'] === 'completed' && $newStatus !== 'reopen-request') {
            return ["error" => "Case is completed. You can only request reopen"];
        }

        // Update in DB
        $caseModel->updateCaseStatus($caseId, $newStatus);

        // Emit SSE Event removed

        return [
            "success" => true,
            "case_id" => $caseId,
            "new_status" => $newStatus
        ];
    }

    public function changeStatus($caseId, $newStatus)
    {
        if (session_status() === PHP_SESSION_NONE) session_start();

        $userId = $_SESSION['user_id'];
        $role   = $_SESSION['role'];

        require_once __DIR__ . '/../helpers/status.php';

        $caseModel = new CaseModel();
        $case = $caseModel->findById($caseId);

        if (!$case) return ["error" => "Case not found"];

        $current = $case['status'];

        if (!in_array($newStatus, valid_case_statuses())) {
            return ["error" => "Invalid target status"];
        }

        if (!can_transition($current, $newStatus)) {
            return [
                "error" => "Invalid status transition",
                "from" => $current,
                "to" => $newStatus
            ];
        }

        // permissions
        if ($newStatus === "in-progress" && $role === "employee") {

            if ($case['assigned_employee'] != $userId) {
                return ["error" => "Not your case"];
            }

            // ⭐ One case rule:
            $caseModel = new CaseModel();
            if ($caseModel->employeeHasActiveCase($userId)) {
                // BUT allow if the case itself is the one in-progress
                if ($case['status'] !== 'in-progress') {
                    return ["error" => "You already have an active case. Complete it before starting another."];
                }
            }
        }


        if ($newStatus === "approved" && $role === "manager") {
            if ($case['assigned_manager'] != $userId) {
                return ["error" => "You are not the manager for this case"];
            }
        }

        // 🔥 Apply status change
        $caseModel->updateCaseStatus($caseId, $newStatus);
        log_case_activity($caseId, $userId, "status_change", [
            "from" => $current,
            "to" => $newStatus
        ]);

        // Emit SSE Event removed

        // Firebase notification stub
        send_firebase_notification("case_{$caseId}", [
            "title" => "Status updated",
            "body"  => "Case #$caseId is now: $newStatus",
            "case_id" => $caseId
        ]);

        return [
            "success" => true,
            "case_id" => $caseId,
            "old_status" => $current,
            "new_status" => $newStatus
        ];
    }

    // public function requestCompletion($caseId)
    // {
    //     if (session_status() === PHP_SESSION_NONE) session_start();

    //     $userId = $_SESSION['user_id'] ?? null;
    //     $role   = $_SESSION['role'] ?? null;

    //     if ($role !== 'employee') {
    //         return ["error" => "Only employees can request case completion"];
    //     }

    //     $caseModel = new CaseModel();
    //     $case = $caseModel->findById($caseId);

    //     if (!$case) return ["error" => "Case not found"];
    //     if ($case['assigned_employee'] != $userId) {
    //         return ["error" => "This case is not assigned to you"];
    //     }

    //     if ($case['status'] !== 'in-progress') {
    //         return ["error" => "You can only complete a case that is in progress"];
    //     }

    //     $caseModel->requestCaseCompletion($caseId);

    //     log_case_activity($caseId, $userId, "case_completion_requested", [
    //         "employee" => $userId
    //     ]);

    //     // notify manager
    //     $managerId = $case['assigned_manager'];
    //     if ($managerId) {
    //         send_firebase_notification("user_{$managerId}", [
    //             "title" => "Case completion requested",
    //             "body"  => "Employee requested completion for case #{$caseId}",
    //             "case_id" => $caseId
    //         ]);
    //     }

    //     return [
    //         "success" => true,
    //         "case_id" => $caseId,
    //         "status" => "waiting-case-approval"
    //     ];
    // }

    // public function approveCompletion($caseId)
    // {
    //     if (session_status() === PHP_SESSION_NONE) session_start();

    //     $userId = $_SESSION['user_id'] ?? null;
    //     $role   = $_SESSION['role'] ?? null;

    //     if (!in_array($role, ['manager', 'admin'])) {
    //         return ["error" => "Only manager or admin can approve case completion"];
    //     }

    //     $caseModel = new CaseModel();
    //     $case = $caseModel->findById($caseId);

    //     if (!$case) return ["error" => "Case not found"];

    //     if ($role === 'manager' && $case['assigned_manager'] != $userId) {
    //         return ["error" => "You are not assigned to this case"];
    //     }

    //     if ($case['status'] !== 'waiting-case-approval') {
    //         return ["error" => "Case is not waiting for completion approval"];
    //     }

    //     $caseModel->approveCaseCompletion($caseId, $userId);

    //     log_case_activity($caseId, $userId, "case_approved", [
    //         "manager" => $userId
    //     ]);

    //     // notify employee
    //     send_firebase_notification("user_{$case['assigned_employee']}", [
    //         "title" => "Case Approved",
    //         "body"  => "Your case #{$caseId} has been approved.",
    //         "case_id" => $caseId
    //     ]);

    //     return [
    //         "success" => true,
    //         "case_id" => $caseId,
    //         "status" => "completed"
    //     ];
    // }

    public function requestReopen($caseId)
    {
        if (session_status() === PHP_SESSION_NONE) session_start();

        $userId = $_SESSION['user_id'] ?? null;
        $role   = $_SESSION['role'] ?? null;

        if ($role !== 'employee') {
            return ["error" => "Only employees can request case reopen"];
        }

        $caseModel = new CaseModel();
        $case = $caseModel->findById($caseId);

        if (!$case) return ["error" => "Case not found"];
        if ($case['assigned_employee'] != $userId) {
            return ["error" => "This case is not assigned to you"];
        }

        if ($case['status'] !== 'completed') {
            return ["error" => "You can only reopen completed cases"];
        }

        // timeline
        log_case_activity($caseId, $userId, "reopen_requested", [
            "employee" => $userId
        ]);

        // notify manager
        $managerId = $case['assigned_manager'];
        if ($managerId) {
            send_firebase_notification("user_{$managerId}", [
                "title" => "Reopen Request",
                "body"  => "Employee requested to reopen case #{$caseId}",
                "case_id" => $caseId
            ]);
        }

        return [
            "success" => true,
            "case_id" => $caseId,
            "message" => "Reopen request sent to manager"
        ];
    }


    public function approveReopen($caseId)
    {
        if (session_status() === PHP_SESSION_NONE) session_start();

        $userId = $_SESSION['user_id'] ?? null;
        $role   = $_SESSION['role'] ?? null;

        if (!in_array($role, ['manager', 'admin'])) {
            return ["error" => "Only manager or admin can approve reopen"];
        }

        $caseModel = new CaseModel();
        $case = $caseModel->findById($caseId);

        if (!$case) return ["error" => "Case not found"];

        if ($role === 'manager' && $case['assigned_manager'] != $userId) {
            return ["error" => "You are not assigned to this case"];
        }

        if ($case['status'] !== 'completed') {
            return ["error" => "Only completed cases can be reopened"];
        }

        // change status to reopened → in-progress
        $caseModel->updateCaseStatus($caseId, "reopened");
        $caseModel->updateCaseStatus($caseId, "in-progress");

        log_case_activity($caseId, $userId, "case_reopened", [
            "manager" => $userId
        ]);

        send_firebase_notification("user_{$case['assigned_employee']}", [
            "title" => "Case Reopened",
            "body"  => "Your case #{$caseId} has been reopened",
            "case_id" => $caseId
        ]);

        return [
            "success" => true,
            "case_id" => $caseId,
            "new_status" => "in-progress"
        ];
    }

    public function startCase($caseId)
    {
        if (session_status() === PHP_SESSION_NONE) session_start();

        $userId = $_SESSION['user_id'] ?? null;
        $role   = $_SESSION['role'] ?? null;

        if (!$userId || $role !== 'employee') {
            return ["error" => "Only employees can start a case"];
        }

        $caseModel = new CaseModel();
        $case = $caseModel->findById($caseId);

        if (!$case) {
            return ["error" => "Case not found"];
        }

        // Must be assigned to this employee
        if ((int)$case['assigned_employee'] !== (int)$userId) {
            return ["error" => "This case is not assigned to you"];
        }

        // Must be in 'assigned' state
        if ($case['status'] !== 'assigned') {
            return ["error" => "Case cannot be started. Status: " . $case['status']];
        }

        // Check if employee already has an active in-progress case
        if ($caseModel->employeeHasActiveCase($userId)) {
            return ["error" => "You already have an active case. Complete it before starting another."];
        }

        // Change status to in-progress
        $caseModel->updateCaseStatus($caseId, "in-progress");

        // Log activity
        log_case_activity($caseId, $userId, "case_started", ["by" => $userId]);

        return [
            "success" => true,
            "case_id" => $caseId,
            "new_status" => "in-progress"
        ];
    }

    public function requestCompletion($caseId)
{
    if (session_status() === PHP_SESSION_NONE) session_start();

    $userId = $_SESSION['user_id'] ?? null;
    $role   = $_SESSION['role'] ?? null;

    if (!$userId) return ["error" => "Unauthorized"];

    // Only employee should normally call this, but admin/manager via UI could too
    if ($role !== "employee") {
        return ["error" => "Only employees can request completion"];
    }

    $caseModel = new CaseModel();
    $case = $caseModel->findById($caseId);
    if (!$case) return ["error" => "Case not found"];

    if ((int)$case['assigned_employee'] !== (int)$userId) {
        return ["error" => "This case is not assigned to you"];
    }

    if ($case['status'] !== "in-progress") {
        return ["error" => "You can only request completion for cases that are in-progress"];
    }

    // update status
    $caseModel->updateCaseStatus($caseId, "awaiting-completion-approval");

    // log
    if (function_exists('log_case_activity')) {
        log_case_activity($caseId, $userId, "case_completion_requested", ["by" => $userId]);
    }

    // notify manager if present
    if (!empty($case['assigned_manager']) && function_exists('send_firebase_notification')) {
        send_firebase_notification("user_" . $case['assigned_manager'], [
            "title" => "Completion Requested",
            "body"  => "Employee requested completion for Case #{$caseId}",
            "case_id" => $caseId
        ]);
    }

    return ["success" => true, "message" => "Completion request sent", "new_status" => "awaiting-completion-approval"];
}

public function approveCompletion($caseId)
{
    if (session_status() === PHP_SESSION_NONE) session_start();

    $userId = $_SESSION['user_id'] ?? null;
    $role   = $_SESSION['role'] ?? null;

    if (!$userId || !in_array($role, ['manager','admin'])) {
        return ["error" => "Only manager or admin can approve completion"];
    }

    $caseModel = new CaseModel();
    $case = $caseModel->findById($caseId);
    if (!$case) return ["error" => "Case not found"];

    // If manager, must be the assigned manager
    if ($role === 'manager' && (int)$case['assigned_manager'] !== (int)$userId) {
        return ["error" => "You are not the assigned manager for this case"];
    }

    // Only allow if case is awaiting approval
    if ($case['status'] !== 'awaiting-completion-approval') {
        return ["error" => "Case is not awaiting completion approval"];
    }

    // Approve completion (use CaseModel's approveCaseCompletion or updateStatus)
    if (method_exists($caseModel, 'approveCaseCompletion')) {
        $caseModel->approveCaseCompletion($caseId, $userId);
    } else {
        $caseModel->updateCaseStatus($caseId, 'completed');
    }

    // log
    if (function_exists('log_case_activity')) {
        log_case_activity($caseId, $userId, 'case_completion_approved', ["approved_by" => $userId]);
    }

    // notify employee
    if (!empty($case['assigned_employee']) && function_exists('send_firebase_notification')) {
        send_firebase_notification("user_" . $case['assigned_employee'], [
            "title" => "Case Completed",
            "body"  => "Manager approved completion for Case #{$caseId}",
            "case_id" => $caseId
        ]);
    }

    return ["success" => true, "case_id" => $caseId, "new_status" => "completed"];
}

public function listPendingApprovals()
{
    if (session_status() === PHP_SESSION_NONE) session_start();
    $userId = $_SESSION['user_id'] ?? null;
    $role   = $_SESSION['role'] ?? null;

    if (!$userId || !in_array($role, ['manager','admin'])) {
        return ["error" => "Unauthorized"];
    }

    $db = db();
    // for manager: only their assigned cases; for admin: all pending
    if ($role === 'manager') {
        $stmt = $db->prepare("
            SELECT c.*, u_mgr.name as manager_name, u_emp.name as employee_name
            FROM cases c
            LEFT JOIN users u_mgr ON u_mgr.id = c.assigned_manager
            LEFT JOIN users u_emp ON u_emp.id = c.assigned_employee
            WHERE (c.status = 'waiting-doc-approval' OR c.status = 'awaiting-completion-approval')
              AND c.assigned_manager = ?
            ORDER BY c.updated_at DESC
        ");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $res = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    } else {
        // admin
        $query = "
            SELECT c.*, u_mgr.name as manager_name, u_emp.name as employee_name
            FROM cases c
            LEFT JOIN users u_mgr ON u_mgr.id = c.assigned_manager
            LEFT JOIN users u_emp ON u_emp.id = c.assigned_employee
            WHERE c.status IN ('waiting-doc-approval', 'awaiting-completion-approval')
            ORDER BY c.updated_at DESC
        ";
        $res = $db->query($query)->fetch_all(MYSQLI_ASSOC);
    }

    return ["success" => true, "cases" => $res];
}
    public function rejectDocs($caseId)
    {
        if (session_status() === PHP_SESSION_NONE) session_start();
        $userId = $_SESSION['user_id'] ?? null;
        $role   = $_SESSION['role'] ?? null;

        if (!in_array($role, ['manager', 'admin'])) {
            return ["error" => "Unauthorized"];
        }

        $caseModel = new CaseModel();
        $case = $caseModel->findById($caseId);

        if (!$case) return ["error" => "Case not found"];

        if ($role === 'manager' && (int)$case['assigned_manager'] !== (int)$userId) {
            return ["error" => "You are not the assigned manager for this case"];
        }

        if ($case['status'] !== 'waiting-doc-approval') {
            return ["error" => "Case is not waiting for document approval"];
        }

        // Revert status to in-progress
        $caseModel->updateCaseStatus($caseId, 'in-progress');

        if (function_exists('log_case_activity')) {
             log_case_activity($caseId, $userId, 'docs_rejected', ["by" => $userId]);
        }

        // notify employee
        if (!empty($case['assigned_employee']) && function_exists('send_firebase_notification')) {
            send_firebase_notification("user_" . $case['assigned_employee'], [
                "title" => "Documents Rejected",
                "body"  => "Your documents for Case #{$caseId} were rejected. Please check and re-upload.",
                "case_id" => $caseId
            ]);
        }

        return ["success" => true, "case_id" => $caseId, "new_status" => "in-progress"];
    }
}
