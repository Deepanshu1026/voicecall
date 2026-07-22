<?php
require_once __DIR__ . '/../../app/helpers/auth.php';
require_once __DIR__ . '/../../app/helpers/db2.php';

require_auth();

// Set time zone
date_default_timezone_set('Asia/Kolkata'); 

header('Content-Type: application/json');

try {
    $conn = db2(); // Use our db2 helper
    
    // Validate inputs
    // We enforce sender_id from session for security
    $senderId = $_SESSION['user_id'];
    
    // However, if the user explicitly wants to check POST for flexible/testing reasons, we could.
    // But for a logged-in agent, it MUST be their ID.
    // The user's snippet used $_POST['sender_id']. 
    // We'll stick to SESSION for security but if they are testing via Postman without session, it would fail.
    // Since we have require_auth(), session is active.
    
    $receiverId = $_POST['receiver_id'] ?? null;
    $message = trim($_POST['message'] ?? '');

    if (!$senderId || !$receiverId) {
        throw new Exception('Missing required parameters');
    }

    $filePath = null;
    $fileType = null;
    $createdAt = date('Y-m-d H:i:s'); // Current timestamp

    // Handle file upload
    if (!empty($_FILES['file']['name']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        $file = $_FILES['file'];

        // Validate MIME type
        if (!in_array($file['type'], $allowedTypes)) {
            throw new Exception('Invalid file type. Only JPG, PNG, and PDF are allowed.');
        }

        // Validate file size (1MB limit)
        if ($file['size'] > 1048576) {
            throw new Exception('File size must be less than 1MB');
        }

        // Secure upload directory - placing in public/uploads1/chatimg/
        // __DIR__ is C:\x...\api\chat
        // Use local file system path for upload
        $uploadDir = __DIR__ . '/../../public/uploads1/chatimg/';
        
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        // Block PHP or any executable files
        $fileExt = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $blockedExt = ['php', 'exe', 'js', 'sh', 'bat', 'html', 'htm', 'pl', 'cgi'];

        if (in_array($fileExt, $blockedExt)) {
            throw new Exception('Executable file types are not allowed.');
        }

        // Rename file uniquely
        $safeFileName = preg_replace("/[^a-zA-Z0-9._-]/", "_", basename($file['name']));
        $fileName = uniqid('chat_', true) . '_' . $safeFileName;
        
        // Save absolute path for move_uploaded_file
        $targetPath = $uploadDir . $fileName;
        
        // Save relative path for database (so it can be served)
        // accessible as /avisaexperts-portal/public/uploads1/chatimg/filename
        $dbFilePath = 'uploads1/chatimg/' . $fileName;
        
        $fileType = $file['type'];

        // Upload file
        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            throw new Exception('Failed to upload file.');
        }
        
        $filePath = $dbFilePath;
    }

    // Insert message
    // Note: The user's snippet included 'status' and 'is_read'.
    $stmt = $conn->prepare("INSERT INTO messages (sender_id, receiver_id, message, file_path, file_type, status, is_read, created_at)
                            VALUES (?, ?, ?, ?, ?, 'Unread', 'no', ?)");
    
    if (!$stmt) {
        throw new Exception('Failed to prepare statement: ' . $conn->error);
    }
    
    $stmt->bind_param("iissss", $senderId, $receiverId, $message, $filePath, $fileType, $createdAt);
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to send message.');
    }

    echo json_encode([
        'success' => true,
        'message_id' => $conn->insert_id,
        'timestamp' => $createdAt,
        'file_path' => $filePath
    ]);

    $stmt->close();

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
