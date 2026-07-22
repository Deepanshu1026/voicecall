<?php
require_once __DIR__ . '/../app/helpers/session.php';
require_once __DIR__ . '/../app/helpers/auth.php';
require_once __DIR__ . '/../app/helpers/db.php';

require_auth();

try {
    $db = db();
    
    // Total cases
    $totalCases = $db->query("SELECT COUNT(*) as count FROM cases")->fetch_assoc()['count'];
    
    // Pending docs approval
    $pendingDocs = $db->query("SELECT COUNT(*) as count FROM cases WHERE status = 'waiting-doc-approval'")->fetch_assoc()['count'];
    
    // Pending completion approval
    $pendingCompletion = $db->query("SELECT COUNT(*) as count FROM cases WHERE status = 'awaiting-completion-approval'")->fetch_assoc()['count'];
    
    // Active employees
    $activeEmployees = $db->query("SELECT COUNT(*) as count FROM users WHERE role = 'employee' AND status = 'active'")->fetch_assoc()['count'];
    
    // Active managers
    $activeManagers = $db->query("SELECT COUNT(*) as count FROM users WHERE role = 'manager' AND status = 'active'")->fetch_assoc()['count'];
    
    // Weekly stats (last 7 days)
    $weeklyStats = [];
    for ($i = 6; $i >= 0; $i--) {
        $date = date('Y-m-d', strtotime("-$i days"));
        $stmt = $db->prepare("SELECT COUNT(*) as count FROM cases WHERE DATE(created_at) = ?");
        $stmt->bind_param("s", $date);
        $stmt->execute();
        $count = $stmt->get_result()->fetch_assoc()['count'];
        
        $weeklyStats[] = [
            'date' => date('M d', strtotime($date)),
            'count' => (int)$count
        ];
    }
    
    // Recent cases
    $recentCases = [];
    $result = $db->query("
        SELECT c.id, c.client_name, c.case_type, c.status, c.created_at,
               u1.name as manager_name, u2.name as employee_name
        FROM cases c
        LEFT JOIN users u1 ON c.assigned_manager = u1.id
        LEFT JOIN users u2 ON c.assigned_employee = u2.id
        ORDER BY c.created_at DESC
        LIMIT 5
    ");
    
    while ($row = $result->fetch_assoc()) {
        $recentCases[] = $row;
    }
    
    echo json_encode([
        "success" => true,
        "stats" => [
            "total_cases" => (int)$totalCases,
            "pending_docs" => (int)$pendingDocs,
            "pending_completion" => (int)$pendingCompletion,
            "active_employees" => (int)$activeEmployees,
            "active_managers" => (int)$activeManagers
        ],
        "weekly_stats" => $weeklyStats,
        "recent_cases" => $recentCases
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "error" => "Failed to load dashboard stats",
        "message" => $e->getMessage()
    ]);
}
