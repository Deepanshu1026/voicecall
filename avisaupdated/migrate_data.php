<?php
require_once __DIR__ . '/app/helpers/db.php';
$db = db();

echo "Starting migration...\n";

// Query to update status
$sql = "UPDATE applications 
        SET status = 'follow_up' 
        WHERE status = 'pending' 
        AND id IN (
            SELECT DISTINCT application_id 
            FROM application_logs 
            WHERE action_type = 'admin_remark'
        )";

if ($db->query($sql) === TRUE) {
    echo "Migration successful. Updated " . $db->affected_rows . " applications to 'follow_up' status.\n";
} else {
    echo "Error updating record: " . $db->error . "\n";
}
?>
