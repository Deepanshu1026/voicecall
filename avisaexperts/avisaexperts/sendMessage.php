<?php
require_once 'include/db.php';
session_start();

// Set time zone
date_default_timezone_set('Asia/Kolkata'); 

header('Content-Type: application/json');

function sendFcmNotification($conn, $serviceAccount, $accessToken, $deviceToken, $title, $body, $dataPayload) {
    $fcm_url = "https://fcm.googleapis.com/v1/projects/" . $serviceAccount['project_id'] . "/messages:send";
    
    $payload = [
        'message' => [
            'token' => $deviceToken,
            'notification' => [
                'title' => $title,
                'body' => $body,
            ],
            'data' => $dataPayload,
            'android' => [
                'priority' => 'high',
                'notification' => [
                    'channel_id' => 'avisa_experts_channel_id',
                    'sound' => 'default',
                ]
            ],
            'apns' => [
                'headers' => [
                    'apns-priority' => '10'
                ],
                'payload' => [
                    'aps' => [
                        'alert' => [
                            'title' => $title,
                            'body' => $body
                        ],
                        'badge' => 1,
                        'sound' => 'default'
                    ]
                ]
            ]
        ]
    ];

    $ch = curl_init($fcm_url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $accessToken,
            'Content-Type: application/json; charset=UTF-8'
        ],
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_TIMEOUT => 10
    ]);
    
    curl_exec($ch);
    curl_close($ch);
}

function getFirebaseAccessToken($serviceAccount) {
    $now = time();
    $header = ['alg' => 'RS256', 'typ' => 'JWT'];
    $claims = [
        'iss' => $serviceAccount['client_email'],
        'scope' => 'https://www.googleapis.com/auth/firebase.messaging',
        'aud' => $serviceAccount['token_uri'],
        'iat' => $now,
        'exp' => $now + 3600
    ];

    function base64url($data) { return rtrim(strtr(base64_encode($data), '+/', '-_'), '='); }
    $input = base64url(json_encode($header)) . '.' . base64url(json_encode($claims));
    $privateKey = openssl_pkey_get_private($serviceAccount['private_key']);
    if (!$privateKey) return null;
    openssl_sign($input, $signature, $privateKey, 'sha256WithRSAEncryption');
    $jwt = $input . '.' . base64url($signature);

    $ch = curl_init($serviceAccount['token_uri']);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded'],
        CURLOPT_POSTFIELDS => http_build_query([
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion' => $jwt
        ]),
        CURLOPT_TIMEOUT => 10
    ]);
    $response = curl_exec($ch);
    curl_close($ch);
    
    $tokenData = json_decode($response, true);
    return $tokenData['access_token'] ?? null;
}

try {
    // Validate inputs
    $senderId = $_POST['sender_id'] ?? null;
    $receiverId = $_POST['receiver_id'] ?? null;
    $message = trim($_POST['message'] ?? '');

    if (!$senderId || !$receiverId) {
        throw new Exception('Missing required parameters');
    }

    $filePath = null;
    $fileType = null;
    $createdAt = date('Y-m-d H:i:s');

    // Handle file upload
    if (!empty($_FILES['file']['name']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        $file = $_FILES['file'];

        if (!in_array($file['type'], $allowedTypes)) {
            throw new Exception('Invalid file type. Only JPG, PNG, and PDF are allowed.');
        }

        if ($file['size'] > 1048576) {
            throw new Exception('File size must be less than 1MB');
        }

        $uploadDir = 'uploads1/chatimg/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $fileExt = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $blockedExt = ['php', 'exe', 'js', 'sh', 'bat', 'html', 'htm', 'pl', 'cgi'];

        if (in_array($fileExt, $blockedExt)) {
            throw new Exception('Executable file types are not allowed.');
        }

        $safeFileName = preg_replace("/[^a-zA-Z0-9._-]/", "_", basename($file['name']));
        $fileName = uniqid('chat_', true) . '_' . $safeFileName;
        $filePath = $uploadDir . $fileName;
        $fileType = $file['type'];

        if (!move_uploaded_file($file['tmp_name'], $filePath)) {
            throw new Exception('Failed to upload file.');
        }
    }

    // Insert message
    $stmt = $conn->prepare("INSERT INTO messages (sender_id, receiver_id, message, file_path, file_type, status, is_read, created_at)
                            VALUES (?, ?, ?, ?, ?, 'Unread', 'no', ?)");
    
    if (!$stmt) {
        throw new Exception('Failed to prepare statement: ' . $conn->error);
    }

    $stmt->bind_param("iissss", $senderId, $receiverId, $message, $filePath, $fileType, $createdAt);
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to send message.');
    }

    $messageId = $conn->insert_id;
    echo json_encode([
        'success' => true,
        'message_id' => $messageId,
        'timestamp' => $createdAt
    ]);

    $stmt->close();

    // ========== REAL-time PUSH NOTIFICATION TO RECEIVER ==========
    $serviceAccountPath = __DIR__ . '/service_account.json';
    if (file_exists($serviceAccountPath)) {
        $serviceAccount = json_decode(file_get_contents($serviceAccountPath), true);
        if (json_last_error() === JSON_ERROR_NONE) {
            $accessToken = getFirebaseAccessToken($serviceAccount);
            
            if ($accessToken) {
                // Get receiver's FCM token(s) - use same table as chat_noti.php
                $tokenStmt = $conn->prepare("SELECT token FROM fcm_tokenscheck WHERE user_id = ? AND token IS NOT NULL AND token != '' ORDER BY created_at DESC LIMIT 1");
                $tokenStmt->bind_param("i", $receiverId);
                $tokenStmt->execute();
                $tokenResult = $tokenStmt->get_result();
                
                if ($tokenResult->num_rows > 0) {
                    $tokenRow = $tokenResult->fetch_assoc();
                    $deviceToken = $tokenRow['token'];
                    
                    // Get sender's name
                    $senderName = 'Someone';
                    $nameStmt = $conn->prepare("SELECT user_name FROM users WHERE id = ? LIMIT 1");
                    $nameStmt->bind_param("i", $senderId);
                    $nameStmt->execute();
                    $nameResult = $nameStmt->get_result();
                    if ($nameRow = $nameResult->fetch_assoc()) {
                        $senderName = $nameRow['user_name'] ?? 'Someone';
                    }
                    $nameStmt->close();
                    
                    $notificationBody = strlen($message) > 100 ? substr($message, 0, 100) . '...' : $message;
                    
                    $dataPayload = [
                        'type' => 'chat',
                        'sender_id' => (string)$senderId,
                        'sender_name' => $senderName,
                        'message' => $message,
                        'message_id' => (string)$messageId,
                        'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
                    ];
                    
                    sendFcmNotification($conn, $serviceAccount, $accessToken, $deviceToken, $senderName, $notificationBody, $dataPayload);
                    
                    // Mark message as notified so chat_noti.php cron doesn't send duplicate
                    $updateStmt = $conn->prepare("UPDATE messages SET count = 1, last_notified_at = ? WHERE id = ?");
                    $notifyTime = date('Y-m-d H:i:s');
                    $updateStmt->bind_param("si", $notifyTime, $messageId);
                    $updateStmt->execute();
                    $updateStmt->close();
                }
                $tokenStmt->close();
            }
        }
    }
    // ========== END PUSH NOTIFICATION ==========

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn->close();
?>
