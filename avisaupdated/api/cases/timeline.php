<?php
require_once __DIR__ . '/../../app/helpers/session.php';
require_once __DIR__ . '/../../app/helpers/auth.php';
require_once __DIR__ . '/../../app/helpers/db.php';

require_auth();

date_default_timezone_set('Asia/Kolkata');
header('Content-Type: application/json');

if (!isset($_GET['case_id'])) {
    echo json_encode([
        "success" => false,
        "error" => "case_id required"
    ]);
    exit;
}

$caseId = (int) $_GET['case_id'];

try {
    $db = db();

    // 1. Fetch Case Activities
    $stmt = $db->prepare("
        SELECT 
            ca.id,
            ca.case_id,
            ca.type,
            ca.user_id,
            u.name AS user_name,
            ca.created_at,
            'case' as source,
            ca.details
        FROM case_activities ca
        LEFT JOIN users u ON ca.user_id = u.id
        WHERE ca.case_id = ?
        ORDER BY ca.created_at DESC
    ");

    $stmt->bind_param("i", $caseId);
    $stmt->execute();
    $caseActivities = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

    // 2. Check for Linked Application
    // Start by checking case remarks for "Created from Application #ID"
    $stmtCheck = $db->prepare("SELECT remarks FROM cases WHERE id = ?");
    $stmtCheck->bind_param("i", $caseId);
    $stmtCheck->execute();
    $caseRow = $stmtCheck->get_result()->fetch_assoc();

    $appLogs = [];
    if ($caseRow && preg_match('/Created from Application #(\d+)/', $caseRow['remarks'], $m)) {
        $appId = (int)$m[1];
        
        // Fetch Application Logs
        // Join users table similar to cases
        $stmtLogs = $db->prepare("
            SELECT 
                al.id,
                ? as case_id,
                al.action_type as type,
                al.user_id,
                COALESCE(u.name, ct.user_name, 'System') AS user_name,
                al.created_at,
                'application' as source,
                al.details
            FROM application_logs al
            LEFT JOIN users u ON al.user_id = u.id
            LEFT JOIN calling_team ct ON al.user_id = ct.id
            WHERE al.application_id = ?
            ORDER BY al.created_at DESC
        ");
        $stmtLogs->bind_param("ii", $caseId, $appId);
        $stmtLogs->execute();
        $appLogs = $stmtLogs->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    // 3. Merge Timeline
    $timeline = array_merge($caseActivities, $appLogs);

    // 4. Sort Combined Timeline Descending
    usort($timeline, function($a, $b) {
        return strtotime($b['created_at']) - strtotime($a['created_at']);
    });

    // 5. Format & Process
    foreach ($timeline as &$row) {
        // Handle Type Prefixing for App Logs
        if (isset($row['source']) && $row['source'] === 'application') {
            $row['type'] = 'app_' . $row['type'];
        }

        // Format Date
        $time = new DateTime($row['created_at']);
        $row['created_at'] = $time->format('Y-m-d h:i:s A');
    }

    echo json_encode([
        "success"  => true,
        "timezone" => "Asia/Kolkata",
        "timeline" => $timeline
    ]);

} catch (Throwable $e) {
    echo json_encode([
        "success" => false,
        "error"   => "Failed to load timeline",
        "message" => $e->getMessage()
    ]);
}
