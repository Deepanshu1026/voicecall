<?php
require_once __DIR__ . '/app/helpers/db.php';
$conn = db();
$result = $conn->query("SELECT * FROM applications");
if ($result) {
    echo "Count: " . $result->num_rows . "\n";
    while ($row = $result->fetch_assoc()) {
        print_r($row);
    }
} else {
    echo "Error: " . $conn->error;
}
?>
