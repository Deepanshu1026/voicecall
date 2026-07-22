<?php
// filepath: c:\xampp\htdocs\avisaexperts-portal\cleanup_checker.php

/**
 * PROJECT CLEANUP CHECKER
 * 
 * This script scans your project and identifies:
 * 1. API files that are NOT routed in index.php
 * 2. Unused helper files
 * 3. Duplicate or old files
 * 
 * ⚠️ DO NOT DELETE FILES WITHOUT REVIEWING FIRST!
 */

echo "<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Project Cleanup Checker</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; margin-top: 30px; }
        .file-list { background: #ecf0f1; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .used { color: #27ae60; font-weight: bold; }
        .unused { color: #e74c3c; font-weight: bold; }
        .warning { color: #f39c12; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #3498db; color: white; }
        tr:hover { background: #f8f9fa; }
        .badge { padding: 4px 8px; border-radius: 3px; font-size: 12px; }
        .badge-success { background: #27ae60; color: white; }
        .badge-danger { background: #e74c3c; color: white; }
        .badge-warning { background: #f39c12; color: white; }
        .stats { display: flex; gap: 20px; margin: 20px 0; }
        .stat-box { flex: 1; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-number { font-size: 36px; font-weight: bold; }
        .stat-label { font-size: 14px; opacity: 0.9; }
        .btn { display: inline-block; padding: 10px 20px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .btn:hover { background: #2980b9; }
        .danger-zone { background: #ffebee; border-left: 4px solid #e74c3c; padding: 15px; margin: 20px 0; }
    </style>
</head>
<body>
<div class='container'>
<h1>🧹 Project Cleanup Checker</h1>
<p><strong>Project:</strong> AvisaExperts Portal</p>
<p><strong>Scanned at:</strong> " . date('Y-m-d H:i:s') . "</p>";

// ========================================
// STEP 1: Read index.php and extract routes
// ========================================
$indexFile = __DIR__ . '/index.php';
$indexContent = file_get_contents($indexFile);

// Extract all require/require_once paths
preg_match_all('/require(?:_once)?\s+__DIR__\s*\.\s*[\'"]([^\'"]+)[\'"]/', $indexContent, $matches);
$routedFiles = $matches[1];

// Normalize paths
$routedFiles = array_map(function($path) {
    return str_replace(['/', '\\'], DIRECTORY_SEPARATOR, trim($path, '/'));
}, $routedFiles);

echo "<h2>📋 Routes Found in index.php</h2>";
echo "<p>Total routed files: <strong>" . count($routedFiles) . "</strong></p>";
echo "<div class='file-list'>";
foreach ($routedFiles as $file) {
    echo "✅ " . htmlspecialchars($file) . "<br>";
}
echo "</div>";

// ========================================
// STEP 2: Scan /api folder for all PHP files
// ========================================
function scanDirectory($dir) {
    $files = [];
    $items = scandir($dir);
    
    foreach ($items as $item) {
        if ($item === '.' || $item === '..') continue;
        
        $path = $dir . DIRECTORY_SEPARATOR . $item;
        
        if (is_dir($path)) {
            $files = array_merge($files, scanDirectory($path));
        } elseif (pathinfo($path, PATHINFO_EXTENSION) === 'php') {
            $files[] = $path;
        }
    }
    
    return $files;
}

$apiFiles = scanDirectory(__DIR__ . '/api');

// Convert to relative paths
$apiFilesRelative = array_map(function($file) {
    return str_replace(__DIR__ . DIRECTORY_SEPARATOR, '', $file);
}, $apiFiles);

echo "<h2>📁 All API Files Found</h2>";
echo "<p>Total API files: <strong>" . count($apiFiles) . "</strong></p>";

// ========================================
// STEP 3: Compare and identify unused files
// ========================================
$unusedFiles = [];
$usedFiles = [];

foreach ($apiFilesRelative as $apiFile) {
    $normalized = str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $apiFile);
    
    $isUsed = false;
    foreach ($routedFiles as $routed) {
        if (strpos($normalized, $routed) !== false || strpos($routed, $normalized) !== false) {
            $isUsed = true;
            break;
        }
    }
    
    if ($isUsed) {
        $usedFiles[] = $apiFile;
    } else {
        $unusedFiles[] = $apiFile;
    }
}

// ========================================
// STEP 4: Display Statistics
// ========================================
echo "<div class='stats'>
    <div class='stat-box' style='background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);'>
        <div class='stat-number'>" . count($usedFiles) . "</div>
        <div class='stat-label'>Used Files</div>
    </div>
    <div class='stat-box' style='background: linear-gradient(135deg, #ee0979 0%, #ff6a00 100%);'>
        <div class='stat-number'>" . count($unusedFiles) . "</div>
        <div class='stat-label'>Unused Files</div>
    </div>
    <div class='stat-box' style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);'>
        <div class='stat-number'>" . count($apiFiles) . "</div>
        <div class='stat-label'>Total Files</div>
    </div>
</div>";

// ========================================
// STEP 5: Display Unused Files
// ========================================
echo "<h2>❌ Unused API Files (Safe to Review for Deletion)</h2>";

if (count($unusedFiles) === 0) {
    echo "<p class='used'>✅ Great! All API files are being used.</p>";
} else {
    echo "<div class='danger-zone'>
        <strong>⚠️ Warning:</strong> Before deleting these files, please review them carefully. 
        Some files might be included indirectly or used in other ways.
    </div>";
    
    echo "<table>";
    echo "<tr><th>#</th><th>File Path</th><th>Size</th><th>Last Modified</th><th>Status</th></tr>";
    
    foreach ($unusedFiles as $index => $file) {
        $fullPath = __DIR__ . DIRECTORY_SEPARATOR . $file;
        $size = file_exists($fullPath) ? filesize($fullPath) : 0;
        $modified = file_exists($fullPath) ? date('Y-m-d H:i', filemtime($fullPath)) : 'N/A';
        
        echo "<tr>";
        echo "<td>" . ($index + 1) . "</td>";
        echo "<td><code>" . htmlspecialchars($file) . "</code></td>";
        echo "<td>" . number_format($size) . " bytes</td>";
        echo "<td>" . $modified . "</td>";
        echo "<td><span class='badge badge-danger'>UNUSED</span></td>";
        echo "</tr>";
    }
    
    echo "</table>";
}

// ========================================
// STEP 6: Display Used Files
// ========================================
echo "<h2>✅ Used API Files</h2>";
echo "<table>";
echo "<tr><th>#</th><th>File Path</th><th>Size</th><th>Status</th></tr>";

foreach ($usedFiles as $index => $file) {
    $fullPath = __DIR__ . DIRECTORY_SEPARATOR . $file;
    $size = file_exists($fullPath) ? filesize($fullPath) : 0;
    
    echo "<tr>";
    echo "<td>" . ($index + 1) . "</td>";
    echo "<td><code>" . htmlspecialchars($file) . "</code></td>";
    echo "<td>" . number_format($size) . " bytes</td>";
    echo "<td><span class='badge badge-success'>USED</span></td>";
    echo "</tr>";
}

echo "</table>";

// ========================================
// STEP 7: Check for helper files
// ========================================
echo "<h2>🔧 Helper Files Check</h2>";

$helperDir = __DIR__ . '/app/helpers';
if (is_dir($helperDir)) {
    $helperFiles = scanDirectory($helperDir);
    echo "<p>Total helper files: <strong>" . count($helperFiles) . "</strong></p>";
    
    echo "<div class='file-list'>";
    foreach ($helperFiles as $helper) {
        $relative = str_replace(__DIR__ . DIRECTORY_SEPARATOR, '', $helper);
        echo "📦 " . htmlspecialchars($relative) . "<br>";
    }
    echo "</div>";
}

// ========================================
// STEP 8: Recommendations
// ========================================
echo "<h2>💡 Recommendations</h2>";
echo "<div class='file-list'>";

if (count($unusedFiles) > 0) {
    echo "<p><strong class='unused'>⚠️ " . count($unusedFiles) . " unused files detected!</strong></p>";
    echo "<ol>";
    echo "<li>Review each unused file to ensure it's truly not needed</li>";
    echo "<li>Check if any file is included indirectly (via require in another file)</li>";
    echo "<li>Make a backup before deleting anything</li>";
    echo "<li>Test your application thoroughly after cleanup</li>";
    echo "</ol>";
} else {
    echo "<p class='used'>✅ Your project is clean! All API files are being used.</p>";
}

echo "</div>";

echo "<div class='danger-zone'>
    <strong>⚠️ Important:</strong> This script only checks files referenced in <code>index.php</code>. 
    Some files might be included dynamically or through other means. Always review before deleting!
</div>";

echo "<a href='.' class='btn'>← Back to Dashboard</a>";

echo "</div>
</body>
</html>";
?>