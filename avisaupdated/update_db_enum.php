<?php
require_once __DIR__ . '/app/helpers/db.php';
$db = db();

try {
    $db->query("ALTER TABLE applications MODIFY COLUMN status ENUM('pending', 'approved', 'rejected', 'follow_up') DEFAULT 'pending'");
    echo "Database updated successfully: Added 'follow_up' to status enum.";
} catch (Exception $e) {
    echo "Error updating database: " . $e->getMessage();
}
?>
