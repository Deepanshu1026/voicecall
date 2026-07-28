<?php
ob_start(); 
ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: text/plain');

echo "--- 🚀 Starting Notification Script (Grouped Mode with Countdown Support) ---\n";

// STEP 1: DB CONNECTION
if (!@include 'include/db.php') {
    die("❌ FATAL ERROR: Could not include 'include/db.php'.");
}
if (!isset($conn) || $conn->connect_error) {
    die("❌ FATAL ERROR: DB connect failed. " . ($conn->connect_error ?? 'N/A'));
}
echo "✅ Step 1: Database connection successful.\n";

// STEP 2: FIREBASE AUTH
$serviceAccountPath = __DIR__ . '/service_account.json';
if (!file_exists($serviceAccountPath)) { die("❌ FATAL: service_account.json missing."); }
$serviceAccount = json_decode(file_get_contents($serviceAccountPath), true);
if (json_last_error() !== JSON_ERROR_NONE) { die("❌ FATAL: Invalid JSON in service_account.json."); }

$now = time();
$header = ['alg' => 'RS256', 'typ' => 'JWT'];
$claims = [
    'iss'   => $serviceAccount['client_email'],
    'scope' => 'https://www.googleapis.com/auth/firebase.messaging',
    'aud'   => $serviceAccount['token_uri'],
    'iat'   => $now,
    'exp'   => $now + 3600
];
function base64url($data) { return rtrim(strtr(base64_encode($data), '+/', '-_'), '='); }

$input = base64url(json_encode($header)) . '.' . base64url(json_encode($claims));
$privateKey = openssl_pkey_get_private($serviceAccount['private_key']);
if (!$privateKey) { die("❌ FATAL: Bad private key."); }
openssl_sign($input, $signature, $privateKey, 'sha256WithRSAEncryption');
$jwt = $input . '.' . base64url($signature);

// Get access token
$ch_auth = curl_init($serviceAccount['token_uri']);
curl_setopt_array($ch_auth, [
    CURLOPT_POST           => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER     => ['Content-Type: application/x-www-form-urlencoded'],
    CURLOPT_POSTFIELDS     => http_build_query([
        'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        'assertion'  => $jwt
    ])
]);
$response = curl_exec($ch_auth);
if (curl_errno($ch_auth)) { die("❌ FATAL: cURL to Google failed: " . curl_error($ch_auth)); }
curl_close($ch_auth);

$tokenData = json_decode($response, true);
if (!isset($tokenData['access_token'])) { die("❌ FATAL: No access token from Google. Response: $response"); }
$accessToken = $tokenData['access_token'];
echo "✅ Step 2: Firebase Access Token received.\n";

// STEP 3: GROUP PROCESSING
$group_size = 20;
$offset     = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

$result = $conn->query("SELECT token FROM fcm_tokenscheck WHERE token IS NOT NULL AND token != '' LIMIT $group_size OFFSET $offset");
if (!$result) { die("❌ DB query failed: " . $conn->error); }

$group_tokens = [];
while ($row = $result->fetch_assoc()) {
    $group_tokens[] = $row['token'];
}
if (empty($group_tokens)) {
    echo "✅ All tokens processed. Done!\n";
    $conn->close();
    ob_end_flush();
    exit;
}
echo "✅ Step 3: Processing group of " . count($group_tokens) . " (offset $offset).\n";

// STEP 4: COUNTDOWN LOGIC (UPDATED FOR START TIME)
$is_countdown = isset($_GET['countdown']) && $_GET['countdown'] === '1';
$countdown_data = [];

if ($is_countdown) {
    echo "🔔 COUNTDOWN MODE ACTIVATED (FOR OFFER STARTING)\n";
    
    $duration_minutes = isset($_GET['duration']) ? (int)$_GET['duration'] : 30;
    $start_time = new DateTime();
    $start_time->add(new DateInterval("PT{$duration_minutes}M")); // Offer STARTS in X minutes
    
    $countdown_data = [
        'type' => 'countdown',
        'start_time' => $start_time->format('Y-m-d\TH:i:s\Z'), // Changed from end_time
        'deal_title' => $_GET['deal_title'] ?? 'Flash Deal',
        'deal_id' => $_GET['deal_id'] ?? 'deal_' . time(),
        'discount' => $_GET['discount'] ?? ''
    ];
    
    echo "   📅 Start Time: " . $start_time->format('Y-m-d H:i:s') . "\n";
    echo "   🏷️  Deal: " . $countdown_data['deal_title'] . "\n";
    echo "   💰 Discount: " . ($countdown_data['discount'] ?: 'N/A') . "\n";
    echo "   ⏱️  Duration: {$duration_minutes} minutes until offer starts\n";
}

// ... rest of your existing code remains exactly the same ...

$notification_title = $_GET['title'] ?? ($is_countdown ? '⏰ Offer Starting Soon!' : 'Bhoot sari nayi opportunity');
$notification_body  = $_GET['body'] ?? ($is_countdown ? '🎯 Get ready for an amazing deal!' : 'Chat karke pata kare [www.avisaexperts.com](https://www.avisaexperts.com) par immigration experts ke sath');


// STEP 5: SEND & CLEANUP THIS GROUP

// ✅ Priority: url > route > default (/appointment)
if (!empty($_GET['url'])) {
    $target_key   = 'url';
    $target_value = $_GET['url'];
} elseif (!empty($_GET['route'])) {
    $target_key   = 'route';
    $cleanRoute   = urldecode($_GET['route']);

    // agar "appointment" aaya hai → usko "/appointment" bana do
    if ($cleanRoute[0] !== '/') {
        $cleanRoute = '/' . $cleanRoute;
    }
    $target_value = $cleanRoute;
} else {
    $target_key   = 'route';
    $target_value = '/home';
}
echo "DEBUG: Target Key = $target_key | Target Value = $target_value\n";

$notification_title = $_GET['title'] ?? ($is_countdown ? '⏰ Flash Deal Alert!' : 'Bhoot sari nayi opportunity');
$notification_body  = $_GET['body'] ?? ($is_countdown ? '🔥 Limited time offer - Act fast!' : 'Chat karke pata kare [www.avisaexperts.com](https://www.avisaexperts.com) par immigration experts ke sath');
$notification_media = $_GET['media'] ?? '';

$fcm_url      = "https://fcm.googleapis.com/v1/projects/" . $serviceAccount['project_id'] . "/messages:send";
$total_sent   = 0;
$total_failed = 0;

$insert_invalid_stmt = $conn->prepare("INSERT INTO invalid_fcm_tokens (token, reason) VALUES (?, ?)");
$delete_valid_stmt   = $conn->prepare("DELETE FROM fcm_tokenscheck WHERE token = ?");

foreach ($group_tokens as $index => $deviceToken) {
    echo " -> Sending to token #" . ($index + 1 + $offset) . ": $deviceToken ... ";

    // ✅ Data payload with countdown support
    $dataPayload = [
        $target_key    => $target_value,
        'click_action' => 'FLUTTER_NOTIFICATION_CLICK'
    ];

    // Add countdown data if this is a countdown notification
    if ($is_countdown) {
        $dataPayload = array_merge($dataPayload, $countdown_data);
        echo "[COUNTDOWN] ";
    }

    $payload = [
        'message' => [
            'token'        => $deviceToken,
            'notification' => [
                'title' => $notification_title,
                'body'  => $notification_body,
                'image' => $notification_media
            ],
            'data' => $dataPayload
        ]
    ];

    $ch_send = curl_init($fcm_url);
    curl_setopt_array($ch_send, [
        CURLOPT_POST           => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => [
            'Authorization: Bearer ' . $accessToken,
            'Content-Type: application/json; charset=UTF-8'
        ],
        CURLOPT_POSTFIELDS     => json_encode($payload)
    ]);

    $fcmResponseJson = curl_exec($ch_send);
    $httpCode        = curl_getinfo($ch_send, CURLINFO_HTTP_CODE);
    curl_close($ch_send);

    $fcmResponse = json_decode($fcmResponseJson, true);

    if ($httpCode === 200 && isset($fcmResponse['name'])) {
        echo "✅ Success\n";
        $total_sent++;
    } elseif (isset($fcmResponse['error'])) {
        $error_status = $fcmResponse['error']['status'] ?? 'UNKNOWN';
        echo "❌ FAILED (Reason: $error_status)\n";
        if (in_array($error_status, ['UNREGISTERED', 'INVALID_ARGUMENT', 'NOT_FOUND'])) {
            $insert_invalid_stmt->bind_param("ss", $deviceToken, $error_status);
            $insert_invalid_stmt->execute();
            $delete_valid_stmt->bind_param("s", $deviceToken);
            $delete_valid_stmt->execute();
            $total_failed++;
        }
    } else {
        echo "❌ FAILED (HTTP Code: $httpCode, Unknown: $fcmResponseJson)\n";
    }

    usleep(200000); // 0.2 sec delay
}

$insert_invalid_stmt->close();
$delete_valid_stmt->close();

echo "\n--- Group Done! Sent: $total_sent | Failed/Moved: $total_failed ---\n";

// Redirect to next group
$next_offset = $offset + $group_size;
$self_url    = $_SERVER['PHP_SELF'] . '?offset=' . $next_offset;

// Preserve all existing parameters
if (isset($_GET['title'])) $self_url .= '&title=' . urlencode($_GET['title']);
if (isset($_GET['body']))  $self_url .= '&body=' . urlencode($_GET['body']);
if (isset($_GET['media'])) $self_url .= '&media=' . urlencode($_GET['media']);
if (isset($_GET['url']))   $self_url .= '&url=' . urlencode($_GET['url']);
if (isset($_GET['route'])) $self_url .= '&route=' . urlencode($_GET['route']);

// Preserve countdown parameters
if (isset($_GET['countdown'])) $self_url .= '&countdown=' . urlencode($_GET['countdown']);
if (isset($_GET['duration'])) $self_url .= '&duration=' . urlencode($_GET['duration']);
if (isset($_GET['deal_title'])) $self_url .= '&deal_title=' . urlencode($_GET['deal_title']);
if (isset($_GET['deal_id'])) $self_url .= '&deal_id=' . urlencode($_GET['deal_id']);
if (isset($_GET['discount'])) $self_url .= '&discount=' . urlencode($_GET['discount']);

header("Refresh: 1; URL=$self_url");

$conn->close();
ob_end_flush();
?>
