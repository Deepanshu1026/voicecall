<?php
require_once __DIR__ . '/app/helpers/db.php';
$db = db();
$result = $db->query("SHOW COLUMNS FROM applications LIKE 'updated_at'");
if ($result->num_rows > 0) {
    echo "Column updated_at exists.";
} else {
    echo "Column updated_at does NOT exist.";
    // Check if I can add it
    // $db->query("ALTER TABLE applications ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
}
?>
