<?php
require_once __DIR__ . '/../helpers/db.php';

class CaseModel
{
    private $db;

    public function __construct()
    {
        $this->db = db();
    }

    /* ------------------------------
        CREATE CASE
    ------------------------------- */
    public function create($data)
    {
        $stmt = $this->db->prepare("
            INSERT INTO cases 
            (client_name, client_phone, case_type, created_by, priority, remarks, agent_name)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");

        $agentName = $data['agent_name'] ?? null;

        $stmt->bind_param(
            "sssisss",
            $data['client_name'],
            $data['client_phone'],
            $data['case_type'],
            $data['created_by'],
            $data['priority'],
            $data['remarks'],
            $agentName
        );

        $stmt->execute();
        return $this->db->insert_id;
    }

    /* ------------------------------
        FIND CASE BY ID
        (WITH MANAGER + EMPLOYEE NAME)
    ------------------------------- */
    public function findById($caseId)
    {
        $stmt = $this->db->prepare("
            SELECT c.*,
                m.name AS manager_name,
                e.name AS employee_name
            FROM cases c
            LEFT JOIN users m ON c.assigned_manager = m.id
            LEFT JOIN users e ON c.assigned_employee = e.id
            WHERE c.id = ?
            LIMIT 1
        ");

        $stmt->bind_param("i", $caseId);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    /* ------------------------------
        LIST CASES BY USER ROLE
        (ADMIN / MANAGER / EMPLOYEE)
    ------------------------------- */
    public function listCasesByRole($role, $userId)
    {
        /* ADMIN — sees all */
        if ($role === 'admin') {
            $query = "
                SELECT c.*,
                    m.name AS manager_name,
                    e.name AS employee_name,
                    ct_created.user_name as agent_name,
                    (SELECT u.name FROM application_logs al JOIN users u ON al.user_id = u.id WHERE al.application_id = app.id AND al.action_type = 'status_change' AND JSON_UNQUOTE(JSON_EXTRACT(al.details, '$.to')) = 'approved' ORDER BY al.id DESC LIMIT 1) as approved_by_name,
                    (SELECT JSON_UNQUOTE(JSON_EXTRACT(al.details, '$.remarks')) FROM application_logs al WHERE al.application_id = app.id AND al.action_type = 'status_change' AND JSON_UNQUOTE(JSON_EXTRACT(al.details, '$.to')) = 'approved' ORDER BY al.id DESC LIMIT 1) as approval_remark
                FROM cases c
                LEFT JOIN users m ON c.assigned_manager = m.id
                LEFT JOIN users e ON c.assigned_employee = e.id
                LEFT JOIN calling_team ct_created ON c.created_by = ct_created.id
                LEFT JOIN applications app ON (c.remarks LIKE 'Created from Application #%' AND app.id = CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(c.remarks, 'Created from Application #', -1), '.', 1) AS UNSIGNED))
                GROUP BY c.id
                ORDER BY c.created_at DESC
            ";
            return $this->db->query($query)->fetch_all(MYSQLI_ASSOC);
        }

        /* MANAGER — sees assigned + created */
        if ($role === 'manager') {
            $stmt = $this->db->prepare("
                SELECT c.*,
                    m.name AS manager_name,
                    e.name AS employee_name,
                    ct_created.user_name as agent_name,
                    (SELECT u.name FROM application_logs al JOIN users u ON al.user_id = u.id WHERE al.application_id = app.id AND al.action_type = 'status_change' AND JSON_UNQUOTE(JSON_EXTRACT(al.details, '$.to')) = 'approved' ORDER BY al.id DESC LIMIT 1) as approved_by_name,
                    (SELECT JSON_UNQUOTE(JSON_EXTRACT(al.details, '$.remarks')) FROM application_logs al WHERE al.application_id = app.id AND al.action_type = 'status_change' AND JSON_UNQUOTE(JSON_EXTRACT(al.details, '$.to')) = 'approved' ORDER BY al.id DESC LIMIT 1) as approval_remark
                FROM cases c
                LEFT JOIN users m ON c.assigned_manager = m.id
                LEFT JOIN users e ON c.assigned_employee = e.id
                LEFT JOIN calling_team ct_created ON c.created_by = ct_created.id
                LEFT JOIN applications app ON (c.remarks LIKE 'Created from Application #%' AND app.id = CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(c.remarks, 'Created from Application #', -1), '.', 1) AS UNSIGNED))
                WHERE c.assigned_manager = ? 
                   OR c.created_by = ?
                GROUP BY c.id
                ORDER BY c.created_at DESC
            ");

            $stmt->bind_param("ii", $userId, $userId);
        }

        /* EMPLOYEE — only their assigned case */ elseif ($role === 'employee') {
            $stmt = $this->db->prepare("
                SELECT c.*,
                    m.name AS manager_name,
                    e.name AS employee_name,
                    ct_created.user_name as agent_name
                FROM cases c
                LEFT JOIN users m ON c.assigned_manager = m.id
                LEFT JOIN users e ON c.assigned_employee = e.id
                LEFT JOIN calling_team ct_created ON c.created_by = ct_created.id
                LEFT JOIN applications app ON (c.remarks LIKE 'Created from Application #%' AND app.id = CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(c.remarks, 'Created from Application #', -1), '.', 1) AS UNSIGNED))
                WHERE c.assigned_employee = ?
                GROUP BY c.id
                ORDER BY c.created_at DESC
            ");

            $stmt->bind_param("i", $userId);
        }

        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    /* ------------------------------
        ASSIGN MANAGER
    ------------------------------- */
    public function assignManager($caseId, $managerId)
    {
        $stmt = $this->db->prepare("
            UPDATE cases 
            SET assigned_manager = ?, 
                status = 'assigned',
                updated_at = NOW() 
            WHERE id = ?
        ");

        $stmt->bind_param("ii", $managerId, $caseId);
        return $stmt->execute();
    }

    public function isEmployeeAssigned($caseId)
    {
        $stmt = $this->db->prepare("SELECT assigned_employee FROM cases WHERE id = ?");
        $stmt->bind_param("i", $caseId);
        $stmt->execute();
        $res = $stmt->get_result()->fetch_assoc();
        return !empty($res['assigned_employee']);
    }

    /* ------------------------------
        ASSIGN EMPLOYEE
    ------------------------------- */
    public function assignEmployee($caseId, $employeeId)
    {
        $stmt = $this->db->prepare("
            UPDATE cases 
            SET assigned_employee = ?, 
                status = 'assigned',
                updated_at = NOW() 
            WHERE id = ?
        ");

        $stmt->bind_param("ii", $employeeId, $caseId);
        return $stmt->execute();
    }

    /* ------------------------------
        ACTIVE CASE CHECK FOR EMPLOYEES
    ------------------------------- */
    public function countOpenCasesForEmployee($employeeId)
    {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) AS cnt 
            FROM cases 
            WHERE assigned_employee = ?
            AND status NOT IN ('completed')
        ");

        $stmt->bind_param("i", $employeeId);
        $stmt->execute();

        $res = $stmt->get_result()->fetch_assoc();
        return (int)$res['cnt'];
    }

    /* ------------------------------
        ALL CASES OF EMPLOYEE
    ------------------------------- */
    public function getByEmployee($employeeId)
    {
        $stmt = $this->db->prepare("
            SELECT c.*,
               m.name AS manager_name,
               e.name AS employee_name
            FROM cases c
            LEFT JOIN users m ON c.assigned_manager = m.id
            LEFT JOIN users e ON c.assigned_employee = e.id
            WHERE c.assigned_employee = ?
            ORDER BY c.created_at DESC
        ");

        $stmt->bind_param("i", $employeeId);
        $stmt->execute();

        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    /* ------------------------------
        GENERIC STATUS UPDATE
    ------------------------------- */
    public function updateCaseStatus($caseId, $status)
    {
        $stmt = $this->db->prepare("UPDATE cases SET status=?, updated_at=NOW() WHERE id=?");
        $stmt->bind_param("si", $status, $caseId);
        return $stmt->execute();
    }

    /* ------------------------------
        EMPLOYEE MARKED DOCS DONE
    ------------------------------- */
    public function setDocsAwaitingApproval($caseId)
    {
        $stmt = $this->db->prepare("
            UPDATE cases 
            SET 
                status = 'waiting-doc-approval',
                docs_status = 'uploaded',
                docs_verified = 0,
                updated_at = NOW()
            WHERE id = ?
        ");

        $stmt->bind_param("i", $caseId);
        return $stmt->execute();
    }

    /* ------------------------------
        MANAGER APPROVES DOCS
    ------------------------------- */
    public function approveDocs($caseId, $managerId)
    {
        $stmt = $this->db->prepare("
            UPDATE cases 
            SET 
                docs_verified = 1,
                docs_verified_by = ?,
                docs_verified_at = NOW(),
                status = 'in-progress',
                docs_status = 'approved',
                updated_at = NOW()
            WHERE id = ?
        ");

        $stmt->bind_param("ii", $managerId, $caseId);
        return $stmt->execute();
    }

    /* ------------------------------
        REQUEST CASE COMPLETION
    ------------------------------- */
    public function requestCaseCompletion($caseId)
    {
        $stmt = $this->db->prepare("
            UPDATE cases 
            SET status = 'awaiting-completion-approval',
                updated_at = NOW()
            WHERE id = ?
        ");

        $stmt->bind_param("i", $caseId);
        return $stmt->execute();
    }

    /* ------------------------------
        MANAGER APPROVES COMPLETION
    ------------------------------- */
    public function approveCaseCompletion($caseId, $approvedBy)
    {
        $stmt = $this->db->prepare("
            UPDATE cases 
            SET status = 'completed',
                updated_at = NOW()
            WHERE id = ?
        ");

        $stmt->bind_param("i", $caseId);
        return $stmt->execute();
    }

    /* ------------------------------
        EMPLOYEE ACTIVE CASE CHECK
    ------------------------------- */
    public function employeeHasActiveCase($employeeId)
    {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as count 
            FROM cases 
            WHERE assigned_employee = ? 
            AND status IN ('in-progress', 'awaiting-completion-approval', 'waiting-doc-approval')
        ");
        $stmt->bind_param("i", $employeeId);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        return $result['count'] > 0;
    }

    public function markDocsRejected($caseId)
    {
        $stmt = $this->db->prepare("
        UPDATE cases SET status='docs-rejected', updated_at=NOW()
        WHERE id=?
    ");
        $stmt->bind_param("i", $caseId);
        return $stmt->execute();
    }

    public function rejectCompletion($caseId)
    {
        $stmt = $this->db->prepare("
        UPDATE cases SET status='in-progress', updated_at=NOW()
        WHERE id=?
    ");
        $stmt->bind_param("i", $caseId);
        return $stmt->execute();
    }
}
