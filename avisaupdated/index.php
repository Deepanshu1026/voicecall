<?php
require_once __DIR__ . '/app/helpers/session.php';
date_default_timezone_set('Asia/Kolkata');

$path = $_GET['path'] ?? null;

// If no path is provided, show landing page
if (!$path) {
    require __DIR__ . '/landing.php';
    exit;
}

header("Content-Type: application/json");

/*
|--------------------------------------------------------------------------
| AUTH ROUTES
|--------------------------------------------------------------------------
*/

if ($path === 'api/login') {
    require __DIR__ . '/api/login.php';
    exit;
}

if ($path === 'api/logout') {
    require __DIR__ . '/api/logout.php';
    exit;
}

// VOICE CALL BRIDGE (agent opens the Node voice dashboard)
if ($path === 'api/voice/bridge') {
    require __DIR__ . '/api/voice/bridge.php';
    exit;
}


/*
|--------------------------------------------------------------------------
| USER ROUTES
|--------------------------------------------------------------------------
*/

// USERS LIST
if ($path === 'api/users/list') {
    require __DIR__ . '/api/users_list.php';
    exit;
}

// CREATE USER
if ($path === 'api/users/create' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    require __DIR__ . '/api/users_create.php';
    exit;
}

// AGENTS LIST (Calling Team)
if ($path === 'api/agents/list') {
    require __DIR__ . '/api/list_agents.php';
    exit;
}

/*
|--------------------------------------------------------------------------
| CASE ROUTES
|--------------------------------------------------------------------------
*/

// CASE LIST
if ($path === 'api/cases/list') {
    require __DIR__ . '/api/list_cases.php';
    exit;
}

// CREATE CASE
if ($path === 'api/cases/create') {
    require __DIR__ . '/api/create_case.php';
    exit;
}

// ASSIGN MANAGER
if ($path === 'api/cases/assign-manager') {
    require __DIR__ . '/api/assign_manager.php';
    exit;
}

// ASSIGN EMPLOYEE
if ($path === 'api/cases/assign-employee') {
    require __DIR__ . '/api/assign_employee.php';
    exit;
}

// EMPLOYEE MY CASES
if ($path === 'api/employee/my-cases') {
    require __DIR__ . '/api/employee_my_cases.php';
    exit;
}

// UPDATE CASE STATUS
if ($path === 'api/cases/update-status') {
    require __DIR__ . '/api/update_status.php';
    exit;
}

// HOLD CASE
if ($path === 'api/cases/hold-case') {
    require __DIR__ . '/api/cases/hold_case.php';
    exit;
}

// RESUME CASE
if ($path === 'api/cases/resume-case') {
    require __DIR__ . '/api/cases/resume_case.php';
    exit;
}


/*
|--------------------------------------------------------------------------
| DOCUMENT ROUTES
|--------------------------------------------------------------------------
*/

// UPLOAD DOCUMENT
if ($path === 'api/cases/upload-document') {
    require __DIR__ . '/api/upload_document.php';
    exit;
}

// UPLOAD CHUNK
if ($path === 'api/cases/upload-chunk') {
    require __DIR__ . '/api/upload_chunk.php';
    exit;
}

// GET DOCUMENTS
if ($path === 'api/cases/documents') {
    require __DIR__ . '/api/get_documents.php';
    exit;
}

// CASE TIMELINE
if ($path === 'api/cases/timeline') {
    require __DIR__ . '/api/cases/timeline.php';
    exit;
}

// MARK DOCS COMPLETE
if ($path === 'api/cases/mark-docs-complete') {
    require __DIR__ . '/api/cases/mark_docs_complete.php';
    exit;
}

// APPROVE DOCS
if ($path === 'api/cases/approve-docs') {
    require __DIR__ . '/api/cases/approve_docs.php';
    exit;
}

// REJECT DOCS
if ($path === 'api/cases/reject-docs') {
    require __DIR__ . '/api/cases/reject_docs.php';
    exit;
}

if ($path === 'api/cases/approve-completion') {
    require __DIR__ . '/api/cases/approve_completion.php';
    exit;
}

// DELETE DOCUMENT
if ($path === 'api/cases/document-delete') {
    require __DIR__ . '/api/cases/document_delete.php';
    exit;
}


/*
|--------------------------------------------------------------------------
| CASE COMPLETION ROUTES
|--------------------------------------------------------------------------
*/

// EMPLOYEE REQUEST COMPLETION
if ($path === 'api/cases/request-completion') {
    require __DIR__ . '/api/cases/request_completion.php';
    exit;
}

// MANAGER/ADMIN APPROVE COMPLETION
if ($path === 'api/cases/approve-completion') {
    require __DIR__ . '/api/cases/approve_completion.php';
    exit;
}

elseif ($path === "api/cases/request-completion") {
    require_once __DIR__ . "/app/controllers/CaseController.php";
    $controller = new CaseController();
    echo json_encode($controller->requestCompletion($_POST['case_id'] ?? 0));
}



/*
|--------------------------------------------------------------------------
| CASE REOPEN ROUTES
|--------------------------------------------------------------------------
*/

// EMPLOYEE REQUEST REOPEN
if ($path === 'api/cases/request-reopen') {
    require __DIR__ . '/api/cases/request_reopen.php';
    exit;
}

// MANAGER/ADMIN APPROVE REOPEN
if ($path === 'api/cases/approve-reopen') {
    require __DIR__ . '/api/cases/approve_reopen.php';
    exit;
}

if ($path === 'api/cases/request-reopen') {
    require __DIR__ . '/api/cases/request_reopen.php';
    exit;
}

// START CASE
if ($path === 'api/cases/start-case') {
    require __DIR__ . '/api/cases/start_case.php';
    exit;
}
if ($path === 'api/cases/pending-approvals') {
    require __DIR__ . '/api/cases/pending_approvals.php';
    exit;
}

// Request completion (employee)
if ($path === 'api/cases/request-completion') {
    require __DIR__ . '/app/controllers/CaseController.php';
    $ctrl = new CaseController();
    echo json_encode($ctrl->requestCompletion($_POST['case_id'] ?? 0));
    exit;
}

// Approve completion (manager/admin)
if ($path === 'api/cases/approve-completion') {
    require __DIR__ . '/app/controllers/CaseController.php';
    $ctrl = new CaseController();
    echo json_encode($ctrl->approveCompletion($_POST['case_id'] ?? 0));
    exit;
}

// List pending approvals (manager/admin)
// if ($path === 'api/cases/pending-approvals') {
//     require __DIR__ . '/app/controllers/CaseController.php';
//     $ctrl = new CaseController();
//     echo json_encode($ctrl->listPendingApprovals());
//     exit;
// }

if ($path === 'api/cases/reject-docs') {
    require __DIR__ . '/api/cases/reject_docs.php';
    exit;
}

if ($path === 'api/cases/reject-completion') {
    require __DIR__ . '/api/cases/reject_completion.php';
    exit;
}

if ($path === 'api/cases/reject-reopen') {
    require __DIR__ . '/api/cases/reject_reopen.php';
    exit;
}

/*
|--------------------------------------------------------------------------
| DASHBOARD ROUTES
|--------------------------------------------------------------------------
*/

// DASHBOARD STATS
if ($path === 'api/dashboard/stats') {
    require __DIR__ . '/api/dashboard_stats.php';
    exit;
}

/*
|--------------------------------------------------------------------------
| APPOINTMENTS ROUTES
|--------------------------------------------------------------------------
*/
if ($path === 'api/appointments/list') {
    require __DIR__ . '/api/appointments_list.php';
    exit;
}

if ($path === 'api/appointments/update-remark') {
    require __DIR__ . '/api/appointments_update_remark.php';
    exit;
}

if ($path === 'api/appointments/update-status') {
    require __DIR__ . '/api/appointments_update_status.php';
    exit;
}


/*
|--------------------------------------------------------------------------
| AGENT ROUTES
|--------------------------------------------------------------------------
*/
if ($path === 'api/agent/submit-application') {
    require_once __DIR__ . '/app/controllers/AgentController.php';
    $ctrl = new AgentController();
    echo json_encode($ctrl->submitApplication());
    exit;
}

if ($path === 'api/agent/update-application') {
    require_once __DIR__ . '/app/controllers/AgentController.php';
    $ctrl = new AgentController();
    echo json_encode($ctrl->updateApplication());
    exit;
}

if ($path === 'api/agent/stats') {
    require_once __DIR__ . '/app/controllers/AgentController.php';
    $ctrl = new AgentController();
    echo json_encode($ctrl->getDashboardStats());
    exit;
}

if ($path === 'api/agent/applications') {
    require_once __DIR__ . '/app/controllers/AgentController.php';
    $ctrl = new AgentController();
    echo json_encode($ctrl->getApplications());
    exit;
}

if ($path === 'api/agent/application-details') {
    require_once __DIR__ . '/app/controllers/AgentController.php';
    $ctrl = new AgentController();
    $id = $_GET['id'] ?? 0;
    echo json_encode($ctrl->getApplicationDetails($id));
    exit;
}

if ($path === 'api/agent/check-contact-history') {
    require_once __DIR__ . '/app/controllers/AgentController.php';
    $ctrl = new AgentController();
    $contact = $_GET['contact'] ?? '';
    echo json_encode($ctrl->checkContactHistory($contact));
    exit;
}

// ADMIN/MANAGER ROUTES FOR AGENT REQUESTS
if ($path === 'api/agent/requests') {
    require_once __DIR__ . '/app/controllers/AgentController.php';
    $ctrl = new AgentController();
    $status = $_GET['status'] ?? null;
    $myList = isset($_GET['my_list']) && $_GET['my_list'] == '1';
    $sortBy = $_GET['sort_by'] ?? 'latest_activity';
    $adminId = $_GET['admin_id'] ?? null;
    echo json_encode($ctrl->getAllApplications($status, $myList, $sortBy, $adminId));
    exit;
}

if ($path === 'api/agent/request-status') {
    require_once __DIR__ . '/app/controllers/AgentController.php';
    $ctrl = new AgentController();
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $id = $input['id'] ?? 0;
    $status = $input['status'] ?? '';
    $remarks = $input['remarks'] ?? '';
    echo json_encode($ctrl->updateStatus($id, $status, $remarks));
    exit;
}

if ($path === 'api/agent/add-remark') {
    require_once __DIR__ . '/app/controllers/AgentController.php';
    $ctrl = new AgentController();
    echo json_encode($ctrl->addRemark());
    exit;
}

if ($path === 'api/agent/edit-remark') {
    require_once __DIR__ . '/app/controllers/AgentController.php';
    $ctrl = new AgentController();
    echo json_encode($ctrl->editRemark());
    exit;
}

if ($path === 'api/admin/daily-logins') {
    require_once __DIR__ . '/app/controllers/AdminController.php';
    $ctrl = new AdminController();
    echo json_encode($ctrl->getDailyLogins());
    exit;
}

// REALTIME STREAM route removed

// REALTIME STREAM route removed

if ($path === 'api/notifications/counts') {
    require_once __DIR__ . '/app/controllers/NotificationController.php';
    $ctrl = new NotificationController();
    echo json_encode($ctrl->getSidebarCounts());
    exit;
}

/*
|--------------------------------------------------------------------------
| DEFAULT 404
|--------------------------------------------------------------------------
*/

echo json_encode(["error" => "Route not found"]);
exit;
