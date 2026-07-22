<?php
// fix_permissions.php
echo "<h3>Windows Permission Fixer Tool</h3>";

$targetDir = __DIR__ . '\public\uploads\chat';

// Ensure directory exists
if (!is_dir($targetDir)) {
    mkdir($targetDir, 0777, true);
    echo "Created directory: $targetDir <br>";
}

echo "Target: $targetDir <br><br>";

// 1. Try modifying permissions using built-in chmod (often ignored on Windows)
chmod($targetDir, 0777);

// 2. Try using Windows ICACLS command to grant access to IIS Users
// 'IUSR' and 'IIS_IUSRS' are the standard groups for web users
$commands = [
    'icacls "'. $targetDir .'" /grant IUSR:(OI)(CI)F /t',
    'icacls "'. $targetDir .'" /grant IIS_IUSRS:(OI)(CI)F /t'
];

$results = [];
foreach ($commands as $cmd) {
    echo "Running: $cmd <br>";
    $output = [];
    $return_var = 0;
    // Check if exec is enabled
    if(function_exists('exec')) {
        exec($cmd, $output, $return_var);
        echo "<pre>" . implode("\n", $output) . "</pre>";
        echo "Return Code: $return_var (0 = Success)<br><hr>";
    } else {
        echo "Error: 'exec' function is disabled on this server.<br><hr>";
    }
}

// 3. Test Writing
$testFile = $targetDir . '/test_perm_check.txt';
if (file_put_contents($testFile, "Write Success!")) {
    echo "<h2 style='color:green'>SUCCESS! The folder is now writable.</h2>";
    echo "You can now use the chat upload.";
    unlink($testFile);
} else {
    echo "<h2 style='color:red'>FAILED.</h2>";
    echo "The script could not unlock the folder.<br>";
    echo "<strong>You MUST do this manually in Plesk:</strong><br>";
    echo "1. Go to File Manager > public > uploads<br>";
    echo "2. Click Lock Icon (Permissions) on 'chat' folder.<br>";
    echo "3. Select 'Plesk IIS User' or 'IWPG_...' user.<br>";
    echo "4. Check 'Full Control' or 'Modify'.<br>";
}
?>
