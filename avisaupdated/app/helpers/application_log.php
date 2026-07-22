<?php
require_once __DIR__ . '/db.php';

/**
 * Log an activity for an application.
 *
 * @param int $appId
 * @param int $userId
 * @param string $actionType
 * @param array $details
 * @return bool
 */
function log_application_activity($appId, $userId, $actionType, $details = []) {
    try {
        $db = db();

        // ✅ Ensure IST timezone
        date_default_timezone_set('Asia/Kolkata');

        // ✅ Current IST time
        $createdAt = date('Y-m-d H:i:s');

        // Convert details to JSON if not empty
        $json = !empty($details) ? json_encode($details) : null;

        // ✅ Explicit created_at insert
        $stmt = $db->prepare("
            INSERT INTO application_logs 
            (application_id, user_id, action_type, details, created_at) 
            VALUES (?, ?, ?, ?, ?)
        ");

        if (!$stmt) {
            error_log("Prepare failed: " . $db->error);
            return false;
        }

        $stmt->bind_param(
            "iisss",
            $appId,
            $userId,
            $actionType,
            $json,
            $createdAt
        );

        if (!$stmt->execute()) {
            error_log("Execute failed: " . $stmt->error);
            return false;
        }

        return true;

    } catch (Throwable $e) {
        error_log("Application log error: " . $e->getMessage());
        return false;
    }
}

/**
 * Get all logs for a specific application.
 *
 * @param int $appId
 * @return array
 */
function get_application_logs($appId) {
    $db = db();

    $stmt = $db->prepare("
        SELECT 
            al.*, 
            COALESCE(u.name, ct.user_name, 'System') AS user_name, 
            u.role AS user_role 
        FROM application_logs al
        LEFT JOIN users u ON al.user_id = u.id
        LEFT JOIN calling_team ct ON al.user_id = ct.id
        WHERE al.application_id = ?
        ORDER BY al.created_at DESC
    ");

    $stmt->bind_param("i", $appId);
    $stmt->execute();

    $logs = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

    /**
     * ✅ Optional: format time (no conversion)
     * If needed on API level
     */
    foreach ($logs as &$log) {
        $log['created_at'] = date(
            'Y-m-d h:i:s A',
            strtotime($log['created_at'])
        );
    }

    return $logs;
}
