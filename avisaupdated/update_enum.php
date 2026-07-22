<?php
require_once __DIR__ . '/app/helpers/db.php';
$db = db();

echo "Checking current ENUM...\n";
$result = $db->query("SHOW COLUMNS FROM cases LIKE 'status'");
$row = $result->fetch_assoc();
echo "Current: " . $row['Type'] . "\n";

$newEnum = "ENUM('pending','assigned','in-progress','docs-needed','docs-collected','completed','reopened','waiting-doc-approval','waiting-case-approval','approved','cancelled','docs-rejected')";

echo "Updating to: $newEnum\n";

$sql = "ALTER TABLE cases MODIFY COLUMN status $newEnum NOT NULL DEFAULT 'pending'";
if ($db->query($sql)) {
    echo "Success!\n";
} else {
    echo "Error: " . $db->error . "\n";
}
