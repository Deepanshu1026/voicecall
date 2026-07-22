<?php
require_once __DIR__ . '/../app/helpers/session.php';
require_once __DIR__ . '/../app/helpers/auth.php';
require_once __DIR__ . '/../app/helpers/db.php';
require_once __DIR__ . '/../app/helpers/activity_log.php';
require_once __DIR__ . '/../app/models/CaseModel.php';
require_once __DIR__ . '/../config/config.php';

require_auth();

if (empty($_FILES['file']) || empty($_POST['case_id'])) {
    echo json_encode(["error" => "file and case_id required"]);
    exit;
}

$caseId = intval($_POST["case_id"]);
$userId = $_SESSION['user_id'];
$db = db();
$caseModel = new CaseModel();
$case = $caseModel->findById($caseId);

if (!$case) {
    echo json_encode(["error" => "Case not found"]);
    exit;
}

// ---------------------------------------------------------------------
// ACTIVE CASE CHECK
// ---------------------------------------------------------------------
if ($_SESSION['role'] === 'employee') {
    $hasAnotherActive = $caseModel->employeeHasActiveCase($userId);
    if ($hasAnotherActive) {
        if (
            $case['assigned_employee'] != $userId ||
            !in_array($case['status'], ['in-progress', 'assigned', 'waiting-doc-approval'])
        ) {
            echo json_encode(["error" => "You must complete your active case first."]);
            exit;
        }
    }
}

// ---------------------------------------------------------------------
// NORMALIZE FILES ARRAY
// ---------------------------------------------------------------------
$files = [];
if (is_array($_FILES['file']['name'])) {
    $count = count($_FILES['file']['name']);
    for ($i = 0; $i < $count; $i++) {
        if ($_FILES['file']['error'][$i] === UPLOAD_ERR_OK) {
            $files[] = [
                'name'     => $_FILES['file']['name'][$i],
                'tmp_name' => $_FILES['file']['tmp_name'][$i],
                'type'     => $_FILES['file']['type'][$i],
                'size'     => $_FILES['file']['size'][$i]
            ];
        }
    }
} else {
    // Single file
    if ($_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $files[] = [
            'name'     => $_FILES['file']['name'],
            'tmp_name' => $_FILES['file']['tmp_name'],
            'type'     => $_FILES['file']['type'],
            'size'     => $_FILES['file']['size']
        ];
    }
}

if (empty($files)) {
    echo json_encode(["error" => "No valid files received"]);
    exit;
}

// ---------------------------------------------------------------------
// PROCESS UPLOADS
// ---------------------------------------------------------------------
$uploaded = [];
$errors = [];
$googleScriptUrl = GOOGLE_SCRIPT_URL;

foreach ($files as $file) {
    $fileName = $file['name'];
    $tmpName  = $file['tmp_name'];
    $ext      = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

    // Validate Extension
    $allowed = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];
    if (!in_array($ext, $allowed)) {
        $errors[] = "$fileName: Invalid type. Only Images and PDF allowed.";
        continue;
    }

    // Prepare Upload
    $fileData = file_get_contents($tmpName);
    $base64   = base64_encode($fileData);
    $fileType = ($ext === 'pdf') ? 'pdf' : 'image';

    $payload = json_encode([
        "filetype"   => $fileType,
        "filename"   => $fileName,
        "fileBase64" => $base64
    ]);

    // Send to Google Script
    $ch = curl_init($googleScriptUrl);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_HTTPHEADER     => ["Content-Type: application/json"],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT        => 45,
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
        
        $uploaded[] = $fileName;
        
        // Log individual activity
        log_case_activity($caseId, $userId, "document_uploaded", ["file_name" => $fileName]);
    } else {
        $errors[] = "$fileName: Upload failed (External Provider Error)";
    }
}

// AUTO-MOVE CASE TO "IN-PROGRESS" IF NEEDED
if (!empty($uploaded) && $_SESSION['role'] === 'employee') {
    if ($case['status'] === 'assigned') {
        if (!$caseModel->employeeHasActiveCase($userId)) {
            $caseModel->updateCaseStatus($caseId, "in-progress");
            log_case_activity($caseId, $userId, "case_started", ["by" => $userId]);
        }
    }
}

if (empty($uploaded)) {
    echo json_encode(["error" => "Failed to upload files: " . implode(", ", $errors)]);
    exit;
}

echo json_encode([
    "success" => true, 
    "uploaded_count" => count($uploaded), 
    "errors" => $errors,
    "last_file_url" => "TODO: multiple" // legacy compat
]);
?>
