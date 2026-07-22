<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<h3>Server Debug Tool (Windows/Plesk Mode)</h3>";

$pathsToCheck = [
    'Root' => __DIR__,
    'Public Uploads' => __DIR__ . '/public/uploads',
    'Chat Uploads' => __DIR__ . '/public/uploads/chat'
];

foreach ($pathsToCheck as $name => $path) {
    echo "<strong>Checking $name:</strong> $path <br>";
    
    if (!is_dir($path)) {
        echo "<span style='color:orange'>&#9888; Directory does not exist. Attempting to create...</span><br>";
        if (@mkdir($path, 0755, true)) {
            echo "<span style='color:green'>&#10004; Created successfully.</span><br>";
        } else {
            echo "<span style='color:red'>&#10008; Failed to create. (Permission Denied)</span><br>";
            continue; 
        }
    }

    $testFile = $path . '/test_write_perm.txt';
    if (@file_put_contents($testFile, "Write test successful: " . date('Y-m-d H:i:s'))) {
        echo "<span style='color:green'>&#10004; Writable! (Success)</span><br>";
        // Clean up
        @unlink($testFile);
    } else {
        echo "<span style='color:red'>&#10008; NOT Writable. (Permission Denied)</span><br>";
        echo "Fix: Go to Plesk File Manager > Find '$path' > Permissions > Grant 'Modify' or 'Full Control' to the user.<br>";
    }
    echo "<hr>";
}
?>
