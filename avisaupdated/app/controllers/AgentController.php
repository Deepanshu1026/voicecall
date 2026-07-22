<?php
require_once __DIR__ . '/../helpers/db.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/application_log.php';

class AgentController
{
    private $db;

    public function __construct()
    {
        date_default_timezone_set('Asia/Kolkata');
        $this->db = db();
    }

    public function submitApplication()
    {
        require_auth();
        require_role('agent');

        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input) {
            return ['error' => 'Invalid JSON'];
        }

        if (empty($input['client_name']) || empty($input['contact_number'])) {
            return ['error' => 'Name and Contact Number are required'];
        }

        $agentId = $_SESSION['user_id'];
        
        // Validate that the agent exists in the database (users OR calling_team)
        $userExists = false;
        
        $checkUser = $this->db->prepare("SELECT id FROM users WHERE id = ?");
        $checkUser->bind_param("i", $agentId);
        $checkUser->execute();
        if ($checkUser->get_result()->num_rows > 0) {
            $userExists = true;
        } else {
             // Check calling_team if not in users
             $checkTeam = $this->db->prepare("SELECT id FROM calling_team WHERE id = ?");
             $checkTeam->bind_param("i", $agentId);
             $checkTeam->execute();
             if ($checkTeam->get_result()->num_rows > 0) {
                 $userExists = true;
             }
        }
        
        if (!$userExists) {
             return ['error' => 'Your session is invalid or the user no longer exists. Please logout and login again.'];
        }

        $clientName = $input['client_name'];
        $contactNumber = $input['contact_number'];
        $details = json_encode($input);

        $createdAt = date('Y-m-d H:i:s');
        if (!empty($input['submission_date'])) {
            $createdAt = $input['submission_date'] . ' ' . date('H:i:s');
        }
        $updatedAt = $createdAt;

        $stmt = $this->db->prepare("INSERT INTO applications (agent_id, client_name, contact_number, details, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("isssss", $agentId, $clientName, $contactNumber, $details, $createdAt, $updatedAt);

        try {
            if ($stmt->execute()) {
                $appId = $stmt->insert_id;
                // Log activity
                if (function_exists('log_application_activity')) {
                    log_application_activity($appId, $agentId, 'created', ['client' => $clientName]);
                }
                return ['success' => true, 'id' => $appId];
            } else {
                return ['error' => 'Database error: ' . $stmt->error];
            }
        } catch (mysqli_sql_exception $e) {
            // Check for Foreign Key constraint failure specifically
            if ($e->getCode() == 1452) {
                 return ['error' => 'Data Integrity Error: The linked user ID does not exist. Please re-login.'];
            }
            return ['error' => 'Database Exception: ' . $e->getMessage()];
        }
    }

    public function updateApplication()
    {
        require_auth();
        require_role('agent');

        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input || empty($input['id'])) {
            return ['error' => 'Invalid Request - Missing ID'];
        }

        // Allow 'not-provided' as valid value
        $clientName = $input['client_name'] ?? '';
        $contactNumber = $input['contact_number'] ?? '';
        
        if (empty($clientName) || empty($contactNumber)) {
            return ['error' => 'Name and Contact Number are required'];
        }

        $appId = $input['id'];
        $agentId = $_SESSION['user_id'];
        
        error_log("UPDATE APPLICATION - ID: $appId, Agent: $agentId, Client: $clientName");
        
        // Verify ownership
        $stmtCheck = $this->db->prepare("SELECT id FROM applications WHERE id = ? AND agent_id = ?");
        $stmtCheck->bind_param("ii", $appId, $agentId);
        $stmtCheck->execute();
        if ($stmtCheck->get_result()->num_rows === 0) {
            error_log("UPDATE FAILED - Application not found or unauthorized");
            return ['error' => 'Application not found or unauthorized'];
        }

        // Remove ID from details json
        unset($input['id']);
        $details = json_encode($input);

        // Always set updated_at to current time in Kolkata
        $updatedAt = date('Y-m-d H:i:s');

        if (!empty($input['submission_date'])) {
            $createdAt = $input['submission_date'] . ' ' . date('H:i:s');
            $stmt = $this->db->prepare("UPDATE applications SET client_name = ?, contact_number = ?, details = ?, created_at = ?, updated_at = ? WHERE id = ?");
            $stmt->bind_param("sssssi", $clientName, $contactNumber, $details, $createdAt, $updatedAt, $appId);
        } else {
            $stmt = $this->db->prepare("UPDATE applications SET client_name = ?, contact_number = ?, details = ?, updated_at = ? WHERE id = ?");
            $stmt->bind_param("ssssi", $clientName, $contactNumber, $details, $updatedAt, $appId);
        }

        if ($stmt->execute()) {
             error_log("UPDATE SUCCESS - Rows affected: " . $stmt->affected_rows);
             // Log activity
             if (function_exists('log_application_activity')) {
                log_application_activity($appId, $agentId, 'updated', ['client' => $clientName]);
            }
            return ['success' => true];
        } else {
            error_log("UPDATE FAILED - Database error: " . $stmt->error);
            return ['error' => 'Database error: ' . $stmt->error];
        }
    }
    public function getDashboardStats()
    {
        require_auth();
        require_role('agent');
        $agentId = $_SESSION['user_id'];

        $stats = [
            'total' => 0,
            'pending' => 0,
            'approved' => 0,
            'rejected' => 0
        ];

        $stmt = $this->db->prepare("SELECT status, COUNT(*) as count FROM applications WHERE agent_id = ? GROUP BY status");
        $stmt->bind_param("i", $agentId);
        $stmt->execute();
        $result = $stmt->get_result();

        while ($row = $result->fetch_assoc()) {
            $stats['total'] += $row['count'];
            if (isset($stats[$row['status']])) {
                $stats[$row['status']] = $row['count'];
            }
        }
        return ['success' => true, 'stats' => $stats];
    }

    public function getApplications()
    {
        require_auth();
        require_role('agent');
        $agentId = $_SESSION['user_id'];

        $stmt = $this->db->prepare("
            SELECT id, client_name, contact_number, status, created_at, details,
            (SELECT COUNT(*) FROM application_logs WHERE application_id = applications.id AND action_type = 'admin_remark') as remark_count 
            FROM applications 
            WHERE agent_id = ? 
            ORDER BY created_at DESC LIMIT 100000
        ");
        $stmt->bind_param("i", $agentId);
        $stmt->execute();
        $result = $stmt->get_result();

        $apps = [];
        while ($row = $result->fetch_assoc()) {
            $apps[] = $row;
        }

        return ['success' => true, 'applications' => $apps];
    }

    public function getAllApplications($status = null, $onlyMyList = false, $sortBy = 'latest_activity', $adminId = null)
    {
        require_auth();
        if (!in_array($_SESSION['role'], ['admin', 'manager'])) {
            return ['error' => 'Unauthorized'];
        }
        $userId = $_SESSION['user_id'];

        $sql = "
            SELECT a.id, a.client_name, a.contact_number, a.status, a.created_at, a.agent_id, a.details,
                   COALESCE(u.name, ct.user_name, 'Unknown') as agent_name,
                   (SELECT COUNT(*) FROM application_logs WHERE application_id = a.id AND action_type = 'admin_remark') as remark_count,
                   (SELECT MAX(created_at) FROM application_logs WHERE application_id = a.id) as latest_log_time
            FROM applications a
            LEFT JOIN users u ON a.agent_id = u.id
            LEFT JOIN calling_team ct ON a.agent_id = ct.id
        ";
        
        $whereClauses = [];
        $params = [];
        $types = "";

        if ($status) {
            if (strpos($status, ',') !== false) {
                $statuses = explode(',', $status);
                $placeholders = implode(',', array_fill(0, count($statuses), '?'));
                $whereClauses[] = "a.status IN ($placeholders)";
                $types .= str_repeat('s', count($statuses));
                foreach ($statuses as $s) $params[] = $s;
            } else {
                $whereClauses[] = "a.status = ?";
                $types .= "s";
                $params[] = $status;
            }
        }

        if ($onlyMyList) {
            // Filter applications where this user has ANY log entry
            $whereClauses[] = "EXISTS (SELECT 1 FROM application_logs al WHERE al.application_id = a.id AND al.user_id = ?)";
            $types .= "i";
            $params[] = $userId;
        } elseif ($adminId) {
             // Filter by specific admin/manager logs
             $whereClauses[] = "EXISTS (SELECT 1 FROM application_logs al WHERE al.application_id = a.id AND al.user_id = ?)";
             $types .= "i";
             $params[] = $adminId;
        }

        if (!empty($whereClauses)) {
            $sql .= " WHERE " . implode(" AND ", $whereClauses);
        }

        // Sorting Logic
        if ($sortBy === 'id') {
            $sql .= " ORDER BY a.id DESC";
        } elseif ($sortBy === 'date') {
            $sql .= " ORDER BY a.created_at DESC";
        } else {
            // Default to latest activity
            $sql .= " ORDER BY COALESCE(latest_log_time, a.created_at) DESC";
        }
        
        $stmt = $this->db->prepare($sql);
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();

        $apps = [];
        while ($row = $result->fetch_assoc()) {
            $apps[] = $row;
        }

        return ['success' => true, 'applications' => $apps];
    }

    // For Admin/Manager to update status
    public function updateStatus($id, $newStatus, $remarks = '')
    {
        require_auth();
        if (!in_array($_SESSION['role'], ['admin', 'manager'])) {
            return ['error' => 'Unauthorized'];
        }

        $userId = $_SESSION['user_id'];
        
        $validStatuses = ['pending', 'approved', 'rejected', 'follow_up'];
        if (!in_array($newStatus, $validStatuses)) {
            return ['error' => 'Invalid status'];
        }

        // Fetch application details first if we need to create a case
        $app = null;
        if ($newStatus === 'approved') {
            $stmtApp = $this->db->prepare("SELECT * FROM applications WHERE id = ?");
            $stmtApp->bind_param("i", $id);
            $stmtApp->execute();
            $resultApp = $stmtApp->get_result();
            $app = $resultApp->fetch_assoc();
            
            if (!$app) {
                return ['error' => 'Application not found'];
            }
        }

        $stmt = $this->db->prepare("UPDATE applications SET status = ? WHERE id = ?");
        $stmt->bind_param("si", $newStatus, $id);
        
        if ($stmt->execute()) {
            // Log activity
            if (function_exists('log_application_activity')) {
                log_application_activity($id, $userId, 'status_change', [
                    'from' => 'previous', 
                    'to' => $newStatus, 
                    'remarks' => $remarks
                ]);
            }

            // Create Case if Approved
            if ($newStatus === 'approved' && $app) {
                require_once __DIR__ . '/../models/CaseModel.php';
                $caseModel = new CaseModel();
                
                // Prevent duplicate cases for the same application
                $searchRemarks = "Created from Application #{$id}.%";
                $checkStmt = $this->db->prepare("SELECT id FROM cases WHERE remarks LIKE ?");
                $checkStmt->bind_param("s", $searchRemarks);
                $checkStmt->execute();
                if ($checkStmt->get_result()->num_rows > 0) {
                     return ['success' => true, 'message' => 'Status updated (Case already exists)'];
                }
                
                $details = json_decode($app['details'], true) ?? [];
                $caseType = $details['visa_type'] ?? 'General';
                
                $caseRemarks = "Created from Application #{$id}. " . $remarks;
                if (!empty($details['visa_country'])) {
                     $caseRemarks .= " Country: " . $details['visa_country'];
                }

                $newCaseData = [
                    'client_name' => substr($app['client_name'], 0, 150),
                    'client_phone' => substr($app['contact_number'], 0, 20),
                    'case_type' => substr($caseType, 0, 100),
                    'created_by' => $userId,
                    'priority' => 'normal',
                    'remarks' => $caseRemarks
                ];
                
                try {
                    $caseId = $caseModel->create($newCaseData);

                    // If Manager approved it, assign to self
                    if ($_SESSION['role'] === 'manager') {
                        $caseModel->assignManager($caseId, $userId);
                    }

                    return ['success' => true, 'case_id' => $caseId];
                } catch (\Throwable $e) {
                    return ['success' => true, 'warning' => 'Status updated but Case creation failed: ' . $e->getMessage()];
                }
            }

            // Delete Case if Rejected
            if ($newStatus === 'rejected') {
                $searchRemarks = "Created from Application #{$id}.%";
                
                // Find associated case
                $findCase = $this->db->prepare("SELECT id FROM cases WHERE remarks LIKE ?");
                $findCase->bind_param("s", $searchRemarks);
                $findCase->execute();
                $caseResult = $findCase->get_result();
                
                if ($row = $caseResult->fetch_assoc()) {
                    $caseId = $row['id'];
                    
                    // Attempt to delete case
                    try {
                        $deleteCase = $this->db->prepare("DELETE FROM cases WHERE id = ?");
                        $deleteCase->bind_param("i", $caseId);
                        $deleteCase->execute();
                    } catch (\Throwable $e) {
                        // Ignore delete errors (e.g. constraints) but maybe log?
                    }
                }
            }

            return ['success' => true];
        } else {
            return ['error' => 'Failed to update status'];
        }
    }

    public function addRemark()
    {
        require_auth();
        if (!in_array($_SESSION['role'], ['admin', 'manager'])) {
            return ['error' => 'Unauthorized'];
        }

        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $id = $input['id'] ?? 0;
        $remarks = $input['remarks'] ?? '';

        if (empty($id) || empty($remarks)) {
             return ['error' => 'ID and Remark are required'];
        }

        $userId = $_SESSION['user_id'];

        // Auto-transition to follow_up if currently pending
        $checkStatus = $this->db->prepare("SELECT status FROM applications WHERE id = ?");
        $checkStatus->bind_param("i", $id);
        $checkStatus->execute();
        $res = $checkStatus->get_result();
        
        if ($row = $res->fetch_assoc()) {
            if ($row['status'] === 'pending') {
                 $newStatus = 'follow_up';
                 $update = $this->db->prepare("UPDATE applications SET status = ?, updated_at = NOW() WHERE id = ?");
                 $update->bind_param("si", $newStatus, $id);
                 $update->execute();
            }
        }

        if (function_exists('log_application_activity')) {
            log_application_activity($id, $userId, 'admin_remark', [ 
                'remarks' => $remarks
            ]);
            return ['success' => true];
        }
        return ['error' => 'Logging not enabled'];
    }

    public function editRemark()
    {
        require_auth();
        if (!in_array($_SESSION['role'], ['admin', 'manager'])) {
            return ['error' => 'Unauthorized'];
        }

        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $logId = $input['log_id'] ?? 0;
        $remarks = $input['remarks'] ?? '';

        if (empty($logId) || empty($remarks)) {
             return ['error' => 'Log ID and Remark are required'];
        }

        // Fetch existing log
        $stmt = $this->db->prepare("SELECT user_id, details FROM application_logs WHERE id = ?");
        $stmt->bind_param("i", $logId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($row = $result->fetch_assoc()) {
            // Verify ownership
            if ($row['user_id'] != $_SESSION['user_id']) {
                return ['error' => 'You can only edit your own remarks'];
            }

            $details = json_decode($row['details'], true) ?? [];
            $details['remarks'] = $remarks; // Update remarks
            $newDetails = json_encode($details);
            
            $update = $this->db->prepare("UPDATE application_logs SET details = ? WHERE id = ?");
            $update->bind_param("si", $newDetails, $logId);
            
            if ($update->execute()) {
                return ['success' => true];
            } else {
                 return ['error' => 'Database update failed'];
            }
        } else {
            return ['error' => 'Log entry not found'];
        }
    }

    public function getApplicationDetails($id)
    {
        require_auth();
        $userId = $_SESSION['user_id'];
        $role = $_SESSION['role'];

        if ($role === 'agent') {
            // Agent sees only their own
            $stmt = $this->db->prepare("
                SELECT a.*, COALESCE(u.name, ct.user_name, 'Unknown') as agent_name 
                FROM applications a
                LEFT JOIN users u ON a.agent_id = u.id
                LEFT JOIN calling_team ct ON a.agent_id = ct.id
                WHERE a.id = ? AND a.agent_id = ?
            ");
            $stmt->bind_param("ii", $id, $userId);
        } elseif (in_array($role, ['admin', 'manager'])) {
            // Admin/Manager sees any
            $stmt = $this->db->prepare("
                SELECT a.*, COALESCE(u.name, ct.user_name, 'Unknown') as agent_name 
                FROM applications a
                LEFT JOIN users u ON a.agent_id = u.id
                LEFT JOIN calling_team ct ON a.agent_id = ct.id
                WHERE a.id = ?
            ");
            $stmt->bind_param("i", $id);
        } else {
            return ['error' => 'Unauthorized'];
        }
        
        $stmt->execute();
        $result = $stmt->get_result();

        if ($row = $result->fetch_assoc()) {
            // Fetch logs for timeline
            $logs = [];
            if (function_exists('get_application_logs')) {
                $logs = get_application_logs($id);
            }

            // Fetch linked case activities
            $search = "Created from Application #{$id}.%";
            $caseStmt = $this->db->prepare("SELECT id FROM cases WHERE remarks LIKE ?");
            $caseStmt->bind_param("s", $search);
            $caseStmt->execute();
            $caseRes = $caseStmt->get_result();

            if ($caseRow = $caseRes->fetch_assoc()) {
                $caseId = $caseRow['id'];
                
                // Fetch case activities adapting to log structure
                $actStmt = $this->db->prepare("
                    SELECT 
                        ca.id, 
                        ca.type as action_type, 
                        ca.created_at, 
                        ca.user_id,
                        COALESCE(u.name, 'System') as user_name,
                        u.role as user_role,
                        'case_activity' as log_source
                    FROM case_activities ca
                    LEFT JOIN users u ON ca.user_id = u.id
                    WHERE ca.case_id = ?
                ");
                $actStmt->bind_param("i", $caseId);
                $actStmt->execute();
                $activities = $actStmt->get_result()->fetch_all(MYSQLI_ASSOC);
                
                // Format dates for consistency if needed, though JS handles it
                foreach ($activities as &$act) {
                    $act['created_at'] = date('Y-m-d h:i:s A', strtotime($act['created_at']));
                    $act['details'] = null; // Ensure key exists
                }

                $logs = array_merge($logs, $activities);
                
                // Sort
                usort($logs, function($a, $b) {
                    return strtotime($b['created_at']) - strtotime($a['created_at']);
                });
            }
            
            return ['success' => true, 'application' => $row, 'logs' => $logs];
        } else {
            return ['error' => 'Application not found'];
        }
    }

    public function checkContactHistory($contactNumber)
    {
        require_auth();
        
        if (empty($contactNumber)) {
            return ['success' => true, 'history' => []];
        }

        $stmt = $this->db->prepare("
            SELECT a.id, a.client_name, a.created_at, a.status, a.details,
                   COALESCE(u.name, ct.user_name, 'Unknown') as agent_name
            FROM applications a
            LEFT JOIN users u ON a.agent_id = u.id
            LEFT JOIN calling_team ct ON a.agent_id = ct.id
            WHERE a.contact_number = ? OR a.contact_number LIKE ?
            ORDER BY a.created_at DESC LIMIT 50
        ");
        
        // Ensure clean string
        $contactNumber = trim($contactNumber);
        $contactSearch = "%" . $contactNumber . "%";
        
        $stmt->bind_param("ss", $contactNumber, $contactSearch);
        $stmt->execute();
        $result = $stmt->get_result();

        $history = [];
        while ($row = $result->fetch_assoc()) {
            $details = json_decode($row['details'], true) ?: [];
            $row['visa_type'] = $details['visa_type'] ?? 'N/A';
            // KEEP details for popup view
            $row['details'] = $details; 
            $history[] = $row;
        }

        return ['success' => true, 'history' => $history];
    }
}
?>
