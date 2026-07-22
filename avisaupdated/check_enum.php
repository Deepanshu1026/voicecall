<?php
require_once __DIR__ . '/../app/helpers/db.php';
$db = db();
$result = $db->query("SHOW COLUMNS FROM cases LIKE 'status'");
$row = $result->fetch_assoc();
echo "Current ENUM: " . $row['Type'] . "\n";
