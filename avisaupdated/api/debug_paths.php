<?php
header('Content-Type: text/plain');

$dirs = [
    'root' => dirname(__DIR__),
    'api' => __DIR__,
    'uploads1' => dirname(__DIR__) . '/uploads1',
    'uploads' => dirname(__DIR__) . '/uploads',
    'public_uploads' => dirname(__DIR__) . '/public/uploads',
    'tmp' => sys_get_temp_dir()
];

echo "DEBUGGING DIRECTORY PERMISSIONS\n";
echo "===============================\n\n";

foreach ($dirs as $name => $path) {
    echo "[$name] Path: $path\n";
    echo "Exists: " . (is_dir($path) ? "YES" : "NO") . "\n";
    if (is_dir($path)) {
        echo "Writable: " . (is_writable($path) ? "YES" : "NO") . "\n";
        
        $testFile = $path . '/test_write_' . time() . '.txt';
        $writeTest = @file_put_contents($testFile, 'test');
        if ($writeTest !== false) {
            echo "Write Test (Manual): SUCCESS\n";
            @unlink($testFile);
        } else {
            $err = error_get_last();
            echo "Write Test (Manual): FAILED - " . ($err['message'] ?? 'Unknown error') . "\n";
        }
    }
    echo "-------------------------------\n";
}

echo "\n_SERVER['DOCUMENT_ROOT']: " . $_SERVER['DOCUMENT_ROOT'] . "\n";
?>
