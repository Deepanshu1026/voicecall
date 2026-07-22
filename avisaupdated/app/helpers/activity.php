<?php
require_once __DIR__ . '/db.php';

function log_case_activity($caseId, $userId, $type, $data = null) {
    $db = db();
    $stmt = $db->prepare("INSERT INTO case_activities (case_id, user_id, type, data) VALUES (?, ?, ?, ?)");
    $json = $data ? json_encode($data) : null;
    $stmt->bind_param("iiss", $caseId, $userId, $type, $json);
    return $stmt->execute();
}
