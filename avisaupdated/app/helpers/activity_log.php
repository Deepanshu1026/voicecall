<?php

function log_case_activity($caseId, $userId, $eventType, $metadata = []) {
    try {
        $db = db();

        // ✅ Ensure timezone is IST
        date_default_timezone_set('Asia/Kolkata');

        // ✅ Current IST timestamp
        $createdAt = date('Y-m-d H:i:s');

        // Metadata handling
        $metadataJson = !empty($metadata) ? json_encode($metadata) : null;

        // ✅ Explicit created_at insert
        $stmt = $db->prepare("
            INSERT INTO case_activities 
            (case_id, user_id, type, metadata, created_at) 
            VALUES (?, ?, ?, ?, ?)
        ");

        $stmt->bind_param(
            "iisss",
            $caseId,
            $userId,
            $eventType,
            $metadataJson,
            $createdAt
        );

        $stmt->execute();

        return true;

    } catch (Throwable $e) {
        error_log("Failed to log activity: " . $e->getMessage());
        return false;
    }
}
