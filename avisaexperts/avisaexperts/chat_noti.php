<?php
ob_start();
ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: text/plain');

// 🔧 FIX 1: SET KOLKATA TIMEZONE GLOBALLY
date_default_timezone_set('Asia/Kolkata');
echo "✅ PHP timezone set to Kolkata: " . date('Y-m-d H:i:s') . "\n";

echo "--- 🚀 Starting Message Notification Script ---\n";

// STEP 1: DB CONNECTION
if (!@include 'include/db.php') {
    die("❌ FATAL ERROR: Could not include 'include/db.php'.");
}
if (!isset($conn) || $conn->connect_error) {
    die("❌ FATAL ERROR: DB connect failed. " . ($conn->connect_error ?? 'N/A'));
}

// 🔧 FIX 2: SET MySQL TO KOLKATA TIMEZONE
$timezone_queries = [
    "SET time_zone = '+05:30'",  // IST timezone
    "SET sql_mode = 'TRADITIONAL'"
];

foreach ($timezone_queries as $query) {
    if (!$conn->query($query)) {
        echo "⚠️ Warning: Could not execute: $query\n";
    }
}

// 🔧 FIX 3: VERIFY KOLKATA TIMEZONE SYNC
$time_check = $conn->query("SELECT NOW() as mysql_time");
if ($time_check) {
    $times = $time_check->fetch_assoc();
    echo "✅ MySQL NOW(): {$times['mysql_time']}\n";
    echo "✅ PHP IST: " . date('Y-m-d H:i:s') . "\n";
}

echo "✅ Step 1: Database connection successful with Kolkata timezone.\n";

// STEP 2: FIREBASE AUTH (Same as your reference code)
$serviceAccountPath = __DIR__ . '/service_account.json';
if (!file_exists($serviceAccountPath)) { 
    die("❌ FATAL: service_account.json missing."); 
}
$serviceAccount = json_decode(file_get_contents($serviceAccountPath), true);
if (json_last_error() !== JSON_ERROR_NONE) { 
    die("❌ FATAL: Invalid JSON in service_account.json."); 
}

$now = time();
$header = ['alg' => 'RS256', 'typ' => 'JWT'];
$claims = [
    'iss' => $serviceAccount['client_email'],
    'scope' => 'https://www.googleapis.com/auth/firebase.messaging',
    'aud' => $serviceAccount['token_uri'],
    'iat' => $now,
    'exp' => $now + 3600
];

function base64url($data) { 
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '='); 
}

$input = base64url(json_encode($header)) . '.' . base64url(json_encode($claims));
$privateKey = openssl_pkey_get_private($serviceAccount['private_key']);
if (!$privateKey) { 
    die("❌ FATAL: Bad private key."); 
}
openssl_sign($input, $signature, $privateKey, 'sha256WithRSAEncryption');
$jwt = $input . '.' . base64url($signature);

// Get access token
$ch_auth = curl_init($serviceAccount['token_uri']);
curl_setopt_array($ch_auth, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded'],
    CURLOPT_POSTFIELDS => http_build_query([
        'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        'assertion' => $jwt
    ])
]);

$response = curl_exec($ch_auth);
if (curl_errno($ch_auth)) { 
    die("❌ FATAL: cURL to Google failed: " . curl_error($ch_auth)); 
}
curl_close($ch_auth);

$tokenData = json_decode($response, true);
if (!isset($tokenData['access_token'])) { 
    die("❌ FATAL: No access token from Google. Response: $response"); 
}
$accessToken = $tokenData['access_token'];
echo "✅ Step 2: Firebase Access Token received.\n";

// 🔧 FIX 4: USE KOLKATA DATES FOR COMPARISON
$current_ist_date = date('Y-m-d'); // Kolkata date
$current_ist_datetime = date('Y-m-d H:i:s'); // Kolkata datetime
echo "Current IST Date: $current_ist_date\n";
echo "Current IST DateTime: $current_ist_datetime\n";

// STEP 3: FETCH UNREAD MESSAGES WITH KOLKATA TIMEZONE LOGIC
echo "✅ Step 3: Fetching unread messages...\n";
$unread_query = "
    SELECT 
        m.id AS message_id,
        m.sender_id, 
        m.receiver_id, 
        m.message,
        DATE(m.created_at) as created_date,
        m.created_at,
        m.count,
        DATE(m.last_notified_at) as last_notified_date,
        m.last_notified_at,
        u.user_name,
        u.user_profile
    FROM messages m
    INNER JOIN users u ON m.sender_id = u.id
    WHERE m.status = 'unread'
    ORDER BY m.created_at DESC
";

$unread_result = $conn->query($unread_query);
if (!$unread_result) {
    die("❌ DB query failed for unread messages: " . $conn->error);
}

$notifications_sent = 0;
$total_messages = $unread_result->num_rows;
echo "Found $total_messages unread messages.\n";

// Track per-user sends to avoid spam
$user_send_count = [];
$max_sends_per_user = 3;

// STEP 4: PROCESS EACH UNREAD MESSAGE
while ($message_row = $unread_result->fetch_assoc()) {
    $message_id = $message_row['message_id'];
    $sender_id = $message_row['sender_id'];
    $receiver_id = $message_row['receiver_id'];
    $message_text = $message_row['message'];
    
    // 🔧 FIX 5: PROPER KOLKATA DATE HANDLING
    $created_at_ist = $message_row['created_date']; // Already in IST from DB
    $last_notified_at_ist = $message_row['last_notified_date']; // Already in IST from DB
    
    $count = $message_row['count'];
    $sender_name = $message_row['user_name'];
    $sender_profile = $message_row['user_profile'];
    
    echo "\n--- Processing message ID: $message_id from sender_id: $sender_id to receiver_id: $receiver_id ---\n";
    echo "Created: $created_at_ist, Last notified: " . ($last_notified_at_ist ?? 'Never') . ", Current IST: $current_ist_date\n";
    
    // STEP 5: CHECK IF RECEIVER EXISTS (can be user or agent)
    $user_role_query = "SELECT user_role, user_name FROM users WHERE id = ? LIMIT 1";
    $user_role_stmt = $conn->prepare($user_role_query);
    $user_role_stmt->bind_param("i", $receiver_id);
    $user_role_stmt->execute();
    $role_result = $user_role_stmt->get_result();
    
    if ($role_result->num_rows === 0) {
        echo "❌ Receiver ID $receiver_id not found in users table. Skipping...\n";
        continue;
    }
    
    $role_row = $role_result->fetch_assoc();
    $receiver_role = $role_row['user_role'] ?? 'User';
    
    echo "✅ Receiver ID $receiver_id has role '$receiver_role'. Proceeding...\n";
    
    // STEP 6: FETCH FCM TOKEN FOR RECEIVER
    $token_query = "SELECT token 
                FROM fcm_tokenscheck 
                WHERE user_id = ? 
                  AND token IS NOT NULL 
                  AND token != '' 
                ORDER BY created_at DESC 
                LIMIT 1";
    $token_stmt = $conn->prepare($token_query);
    $token_stmt->bind_param("i", $receiver_id);
    $token_stmt->execute();
    $token_result = $token_stmt->get_result();
    
    if ($token_result->num_rows === 0) {
        echo "❌ No FCM token found for receiver ID $receiver_id. Skipping...\n";
        continue;
    }
    
    $token_row = $token_result->fetch_assoc();
    $device_token = $token_row['token'];
    
    echo "✅ FCM token found for receiver ID $receiver_id\n";
    
    // 🔧 FIX 6: IMPROVED DUPLICATE PREVENTION WITH KOLKATA TIME
    $should_send_notification = false;
    
    if ($count == 0) {
        // Never notified before
        $should_send_notification = true;
        echo "✅ Message never notified before. Will send notification.\n";
    } elseif ($count == 1 && ($last_notified_at_ist === null || $last_notified_at_ist < $current_ist_date)) {
        // Was notified before but on a different day (in IST)
        $should_send_notification = true;
        echo "✅ Message was notified on previous day ($last_notified_at_ist). Will send notification for today.\n";
        
        // 🔧 FIX 7: RESET COUNT BEFORE SENDING
        $reset_query = "UPDATE messages SET count = 0 WHERE id = ?";
        $reset_stmt = $conn->prepare($reset_query);
        $reset_stmt->bind_param("i", $message_id);
        $reset_stmt->execute();
        $count = 0;
        echo "🔄 Reset count to 0 for message ID $message_id\n";
    } else {
        echo "❌ Message already notified today (count: $count, last_notified: $last_notified_at_ist). Skipping...\n";
    }
    
    if (!$should_send_notification) {
        continue;
    }
    
    // Optional: Check per-user daily limit
    if (!isset($user_send_count[$receiver_id])) {
        $user_send_count[$receiver_id] = 0;
    }
    if ($user_send_count[$receiver_id] >= $max_sends_per_user) {
        echo "❌ Daily notification limit reached for receiver ID $receiver_id. Skipping...\n";
        continue;
    }
    
    // STEP 7: PREPARE AND SEND NOTIFICATION
    $fcm_url = "https://fcm.googleapis.com/v1/projects/" . $serviceAccount['project_id'] . "/messages:send";
    
    // Prepare notification content
    $notification_title = "New message from " . $sender_name;
    $notification_body = substr($message_text, 0, 100) . (strlen($message_text) > 100 ? '...' : '');
    
    // Data payload for app navigation
    // Route: /main for users, /consultant for agents
    $route = strtolower($receiver_role) === 'agent' ? '/consultant' : '/main';
    $tab = strtolower($receiver_role) === 'agent' ? 0 : 2;
    
    $dataPayload = [
        'type' => 'chat',
        'sender_id' => (string)$sender_id,
        'sender_name' => $sender_name,
        'sender_profile' => $sender_profile,
        'receiver_id' => (string)$receiver_id,
        'message_preview' => $notification_body,
        'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
        'route' => $route,
        'arguments' => json_encode(['tab' => $tab])
    ];
    
    $payload = [
        'message' => [
            'token' => $device_token,
            'notification' => [
                'title' => $notification_title,
                'body' => $notification_body,
                'image' => $sender_profile
            ],
            'data' => $dataPayload,
            'android' => [
                'priority' => 'high',
                'notification' => [
                    'channel_id' => 'message_channel',
                    'sound' => 'default',
                    'icon' => 'ic_notification'
                ]
            ],
            'apns' => [
                'headers' => [
                    'apns-priority' => '10'
                ],
                'payload' => [
                    'aps' => [
                        'alert' => [
                            'title' => $notification_title,
                            'body' => $notification_body
                        ],
                        'badge' => 1,
                        'sound' => 'default'
                    ]
                ]
            ]
        ]
    ];
    
    // Send notification
    $ch_send = curl_init($fcm_url);
    curl_setopt_array($ch_send, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $accessToken,
            'Content-Type: application/json; charset=UTF-8'
        ],
        CURLOPT_POSTFIELDS => json_encode($payload)
    ]);
    
    $fcm_response_json = curl_exec($ch_send);
    $http_code = curl_getinfo($ch_send, CURLINFO_HTTP_CODE);
    curl_close($ch_send);
    
    $fcm_response = json_decode($fcm_response_json, true);
    
    if ($http_code === 200 && isset($fcm_response['name'])) {
        echo "✅ Notification sent successfully for message ID $message_id (to receiver ID $receiver_id)\n";
        $notifications_sent++;
        
        // 🔧 FIX 8: UPDATE WITH KOLKATA TIMESTAMP
        $update_count_query = "UPDATE messages SET count = 1, last_notified_at = ? WHERE id = ?";
        $update_stmt = $conn->prepare($update_count_query);
        $update_stmt->bind_param("si", $current_ist_datetime, $message_id);
        $update_stmt->execute();
        
        echo "✅ Updated message $message_id with IST time: $current_ist_datetime\n";
        
        // Increment user send count
        $user_send_count[$receiver_id]++;
        
    } else {
        $error_status = $fcm_response['error']['status'] ?? 'UNKNOWN';
        echo "❌ Failed to send notification: $error_status (HTTP: $http_code)\n";
        
        // Handle invalid tokens
        if (in_array($error_status, ['UNREGISTERED', 'INVALID_ARGUMENT', 'NOT_FOUND'])) {
            echo "🗑️ Removing invalid FCM token for user ID $receiver_id\n";
            $delete_token_query = "DELETE FROM fcm_tokenscheck WHERE user_id = ? AND token = ?";
            $delete_stmt = $conn->prepare($delete_token_query);
            $delete_stmt->bind_param("is", $receiver_id, $device_token);
            $delete_stmt->execute();
        }
    }
    
    // Small delay to avoid rate limiting
    usleep(100000); // 0.1 second
}

echo "\n--- 🎉 Notification Script Complete ---\n";
echo "Total messages processed: $total_messages\n";
echo "Notifications sent: $notifications_sent\n";
echo "Final IST Time: " . date('Y-m-d H:i:s') . "\n";
$conn->close();
ob_end_flush();
?>
