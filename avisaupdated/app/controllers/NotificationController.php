<?php
require_once __DIR__ . '/../helpers/db.php';
require_once __DIR__ . '/../helpers/db2.php';
require_once __DIR__ . '/../helpers/auth.php';

class NotificationController
{
    private $db;

    public function __construct()
    {
        $this->db = db();
    }

    public function getSidebarCounts()
    {
        if (session_status() === PHP_SESSION_NONE) session_start();
        $userId = $_SESSION['user_id'] ?? 0;
        $role   = $_SESSION['role'] ?? '';

        if (!$userId) return ['error' => 'Unauthorized'];

        $counts = [
            'agent_requests' => 0,
            'assigned_cases' => 0,
            'approvals' => 0
        ];

        // 1. Agent Requests (Admin & Manager)
        if (in_array($role, ['admin', 'manager'])) {
            $stmt = $this->db->prepare("SELECT COUNT(*) as total FROM applications WHERE status = 'pending'");
            $stmt->execute();
            $counts['agent_requests'] = $stmt->get_result()->fetch_assoc()['total'];

            // Follow Up Applications
            $stmtRemark = $this->db->prepare("SELECT COUNT(*) as total FROM applications WHERE status = 'follow_up'");
            $stmtRemark->execute();
            $counts['pending_remarks'] = $stmtRemark->get_result()->fetch_assoc()['total'];
        }

        // Count All Cases for Admin
        if ($role === 'admin') {
            $stmtCases = $this->db->prepare("SELECT COUNT(*) as total FROM cases");
            $stmtCases->execute();
            $counts['all_cases'] = $stmtCases->get_result()->fetch_assoc()['total'];
        }

            // 2. Assigned Cases (Manager) - Split into Assigned (Blue) and In-Progress (Yellow)
            if ($role === 'manager') {
                // 'assigned' status
                $stmt = $this->db->prepare("SELECT COUNT(*) as total FROM cases WHERE assigned_manager = ? AND status = 'assigned'");
                $stmt->bind_param("i", $userId);
                $stmt->execute();
                $counts['assigned_cases_new'] = $stmt->get_result()->fetch_assoc()['total'];

                // 'in-progress' status
                $stmt = $this->db->prepare("SELECT COUNT(*) as total FROM cases WHERE assigned_manager = ? AND status = 'in-progress'");
                $stmt->bind_param("i", $userId);
                $stmt->execute();
                $counts['assigned_cases_progress'] = $stmt->get_result()->fetch_assoc()['total'];
                
                // 3. Pending Approvals (Manager)
            // waiting-doc-approval OR awaiting-completion-approval
            $stmt2 = $this->db->prepare("
                SELECT COUNT(*) as total 
                FROM cases 
                WHERE assigned_manager = ? 
                AND status IN ('waiting-doc-approval', 'awaiting-completion-approval', 'reopen-requested')
            ");
            $stmt2->bind_param("i", $userId);
            $stmt2->execute();
            $counts['approvals'] = $stmt2->get_result()->fetch_assoc()['total'];
            $stmt2->execute();
            $counts['approvals'] = $stmt2->get_result()->fetch_assoc()['total'];
        }
        
        // 4. Agent Counts (Chat & Daily Logins)
        if ($role === 'agent') {
            try {
                $db2 = db2();
                
                // Unread Chat Messages
                // Count messages where receiver_id is current user and status is Unread or is_read = 'no'
                // Based on send_message.php, status='Unread', is_read='no'
                // Unread Chat Messages
                // Count messages where receiver_id is current user and status is Unread (0)
                $stmtChat = $this->db->prepare("SELECT COUNT(*) as total FROM messages WHERE receiver_id = ? AND is_read = 0");
                $stmtChat->bind_param("i", $userId);
                $stmtChat->execute();
                $counts['chat_unread'] = $stmtChat->get_result()->fetch_assoc()['total'];
                
                // Daily Logins (Today's count)
                // Assuming 'users' table in db2 tracks logins as per AdminController logic
                $stmtLogin = $db2->query("SELECT COUNT(*) as total FROM users WHERE specialization <> 'guest' AND DATE(created_at) = CURDATE()");
                $counts['daily_logins_today'] = $stmtLogin ? $stmtLogin->fetch_assoc()['total'] : 0;

                // Pending Remarks (Agent's own apps with admin remarks)
                // Using the primary database ($this->db) for applications
                // Follow Up Remarks (formerly Pending Remarks)
                $stmtRemark = $this->db->prepare("SELECT COUNT(*) as total FROM applications WHERE agent_id = ? AND status = 'follow_up'");
                $stmtRemark->bind_param("i", $userId);
                $stmtRemark->execute();
                $counts['agent_pending_remarks'] = $stmtRemark->get_result()->fetch_assoc()['total'];
                
            } catch (Exception $e) {
                // Ignore db2 errors for notifications
            }
        }

        // 5. Today's Appointments Count (Admin & Manager)
        if (in_array($role, ['admin', 'manager'])) {
            try {
                $db2 = db2();
                $stmtApp = $db2->query("SELECT COUNT(*) as total FROM appointments WHERE DATE(date) = CURDATE()");
                $counts['today_appointments'] = $stmtApp ? $stmtApp->fetch_assoc()['total'] : 0;
            } catch (Exception $e) {
                // Ignore errors
            }
        }

        return ['success' => true, 'counts' => $counts];
    }
}
?>
