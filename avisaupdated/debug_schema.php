<?php
require_once __DIR__ . '/app/helpers/db.php';
$conn = db();

echo "Table: calling_team\n";
$result = $conn->query("DESCRIBE calling_team");
if ($result) {
    while($row = $result->fetch_assoc()) {
        echo $row['Field'] . "\n";
    }
} else {
    echo "Error: " . $conn->error . "\n";
}

echo "\nTable: users\n";
$result = $conn->query("DESCRIBE users");
if ($result) {
    while($row = $result->fetch_assoc()) {
        echo $row['Field'] . "\n";
    }
}
?>
