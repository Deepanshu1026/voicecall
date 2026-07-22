<?php
require_once __DIR__ . '/app/helpers/db.php';
require_once __DIR__ . '/app/helpers/application_log.php';

$conn = db();
echo "Log Entries:\n";
$result = $conn->query("SELECT * FROM application_logs");
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        print_r($row);
    }
} else {
    echo "No logs found.\n";
}

echo "\nChecking calling_team for user_id:\n";
$result = $conn->query("SELECT id, user_name FROM calling_team");
while($row = $result->fetch_assoc()) {
    print_r($row);
}
?>
