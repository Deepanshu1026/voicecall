<?php
$config = require __DIR__ . '/config/database.php';

$mysqli = new mysqli($config['host'], $config['user'], $config['pass'], $config['name']);

if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error . "\n");
}

echo "Database connected.\n";

// 1. Check for orphaned records
$checkSql = "SELECT COUNT(*) as count FROM application_logs 
             WHERE application_id NOT IN (SELECT id FROM applications)";

$result = $mysqli->query($checkSql);
$row = $result->fetch_assoc();
$orphanedCount = $row['count'];

if ($orphanedCount > 0) {
    echo "Found $orphanedCount orphaned records in application_logs.\n";
    
    // 2. Delete orphaned records
    $deleteSql = "DELETE FROM application_logs 
                  WHERE application_id NOT IN (SELECT id FROM applications)";
    
    if ($mysqli->query($deleteSql)) {
        echo "Successfully deleted orphaned records.\n";
    } else {
        die("Error deleting records: " . $mysqli->error . "\n");
    }
} else {
    echo "No orphaned records found.\n";
}

// 3. Add the Foreign Key Constraint
$alterSql = "ALTER TABLE `application_logs`
             ADD CONSTRAINT `application_logs_ibfk_1` 
             FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) 
             ON DELETE CASCADE";

echo "Attempting to add Foreign Key constraint...\n";
if ($mysqli->query($alterSql)) {
    echo "SUCCESS: Constraint added successfully!\n";
} elseif ($mysqli->errno == 1061) { // Duplicate key name
     echo "NOTICE: Constraint already exists.\n";
} else {
    echo "ERROR adding constraint: " . $mysqli->error . "\n";
}

$mysqli->close();
