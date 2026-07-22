<?php
require_once __DIR__ . '/../app/helpers/session.php';
require_once __DIR__ . '/../app/helpers/auth.php';
require_once __DIR__ . '/../app/helpers/db.php';
require_once __DIR__ . '/../app/helpers/activity_log.php';
require_once __DIR__ . '/../app/models/CaseModel.php';
require_once __DIR__ . '/../config/config.php';

require_auth();

// Increase limits for processing
set_time_limit(300);
ini_set('memory_limit', '256M');

if (empty($_FILES['chunk']) || !isset($_POST['chunk_index']) || !isset($_POST['total_chunks']) || empty($_POST['upload_id']) || empty($_POST['case_id'])) {
    echo json_encode(["error" => "Missing chunk data"]);
    exit;
}

$caseId = intval($_POST["case_id"]);
$uploadId = $_POST['upload_id']; // Should be sanitized if used in path
$chunkIndex = intval($_POST['chunk_index']);
$totalChunks = intval($_POST['total_chunks']);
$fileName = $_POST['file_name'];
$userId = $_SESSION['user_id'];

// Sanitize uploadId to prevent directory traversal
$uploadId = preg_replace('/[^a-zA-Z0-9_\-]/', '', $uploadId);

// Use system temp directory (the only writable location on Plesk)
$workingBase = sys_get_temp_dir();

if (!$workingBase || !is_writable($workingBase)) {
    echo json_encode(["error" => "System temporary directory is not writable. Please contact server admin."]);
    exit;
}

// Store chunks directly in the base dir with a prefix to avoid mkdir
// Plesk temp dir is shared, so we use a unique project prefix
$chunkFile = $workingBase . DIRECTORY_SEPARATOR . "avisa_chunk_{$uploadId}_{$chunkIndex}";
if (!move_uploaded_file($_FILES['chunk']['tmp_name'], $chunkFile)) {
    $error = error_get_last();
    echo json_encode(["error" => "Failed to save chunk to $chunkFile. PHP Error: " . ($error['message'] ?? 'Unknown error')]);
    exit;
}

// Check completion by counting files with this upload_id prefix
$receivedChunks = count(glob($workingBase . DIRECTORY_SEPARATOR . "avisa_chunk_{$uploadId}_*"));

if ($receivedChunks < $totalChunks) {
    echo json_encode(["success" => true, "status" => "chunk_received", "received" => $receivedChunks, "total" => $totalChunks]);
    exit;
}

// All chunks received, reassemble
try {
    $finalFilePath = $workingBase . DIRECTORY_SEPARATOR . "avisa_final_{$uploadId}_" . time();
    $out = fopen($finalFilePath, 'wb');
    if (!$out) throw new Exception("Cannot create final file in $workingBase");

    for ($i = 0; $i < $totalChunks; $i++) {
        $cPath = $workingBase . DIRECTORY_SEPARATOR . "avisa_chunk_{$uploadId}_{$i}";
        $in = fopen($cPath, 'rb');
        if (!$in) throw new Exception("Missing chunk $i during assembly");
        while ($buff = fread($in, 4096)) {
            fwrite($out, $buff);
        }
        fclose($in);
    }
    fclose($out);

    // Now process the reassembled file exactly like upload_document.php does
    $db = db();
    $caseModel = new CaseModel();
    $case = $caseModel->findById($caseId);
    
    if (!$case) {
        throw new Exception("Case not found");
    }

    $ext = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    $fileData = @file_get_contents($finalFilePath);
    if ($fileData === false) throw new Exception("Failed to read reassembled file from $finalFilePath");
    
    $base64 = base64_encode($fileData);
    $fileType = ($ext === 'pdf') ? 'pdf' : 'image';

    $payload = json_encode([
        "filetype"   => $fileType,
        "filename"   => $fileName,
        "fileBase64" => $base64
    ]);

    $googleScriptUrl = GOOGLE_SCRIPT_URL;
    $ch = curl_init($googleScriptUrl);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_HTTPHEADER     => ["Content-Type: application/json"],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT        => 90, // Increased timeout for larger files
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $result = json_decode($response, true);

    if ($result && !empty($result["url"])) {
        // Save to DB
        $stmt = $db->prepare("INSERT INTO case_documents (case_id, file_name, file_url, uploaded_by) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("issi", $caseId, $fileName, $result["url"], $userId);
        $stmt->execute();
        
        // Log activity
        log_case_activity($caseId, $userId, "document_uploaded", ["file_name" => $fileName]);

        // Cleanup: Delete chunks and final file
        for ($i = 0; $i < $totalChunks; $i++) {
            @unlink($workingBase . DIRECTORY_SEPARATOR . "avisa_chunk_{$uploadId}_{$i}");
        }
        @unlink($finalFilePath);

        echo json_encode([
            "success" => true,
            "completed" => true,
            "url" => $result["url"],
            "file_name" => $fileName
        ]);
    } else {
        throw new Exception("Upload failed (External Provider Error). Check Google Script Logs.");
    }

} catch (Exception $e) {
    // Attempt cleanup on failure
    for ($i = 0; $i < $totalChunks; $i++) {
        @unlink($workingBase . DIRECTORY_SEPARATOR . "avisa_chunk_{$uploadId}_{$i}");
    }
    if (isset($finalFilePath)) @unlink($finalFilePath);
    
    echo json_encode(["error" => $e->getMessage()]);
}
exit;
?>
