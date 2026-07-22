<?php
require_once __DIR__ . '/../../app/helpers/auth.php';
require_once __DIR__ . '/../../app/helpers/db.php';
require_once __DIR__ . '/../../app/helpers/db2.php';

require_auth();

$user_id = $_SESSION['user_id'];
$other_id = $_GET['user_id'] ?? null;

if (!$other_id) {
    echo json_encode(['error' => 'Missing user_id']);
    exit;
}

header('Content-Type: application/json');

try {
    $db2 = db2();
    
    $mark_read = isset($_GET['mark_read']) && $_GET['mark_read'] === 'true';
    $include_profile = isset($_GET['include_profile']) && $_GET['include_profile'] === 'true';

    // 1. Mark as Read (if requested)
    if ($mark_read) {
        $upd = "UPDATE messages SET is_read = 'yes', status = 'Read' WHERE sender_id = ? AND receiver_id = ? AND is_read = 'no'";
        $stmt_upd = $db2->prepare($upd);
        $stmt_upd->bind_param("ii", $other_id, $user_id);
        $stmt_upd->execute();
    }

    // 2. Fetch Messages
    $sql = "SELECT * FROM messages 
            WHERE (sender_id = ? AND receiver_id = ?) 
               OR (sender_id = ? AND receiver_id = ?)
            ORDER BY created_at ASC";
            
    $stmt = $db2->prepare($sql);
    $stmt->bind_param("iiii", $user_id, $other_id, $other_id, $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $messages = [];
    while ($row = $result->fetch_assoc()) {
        $messages[] = $row;
    }

    // 3. Fetch Profile (if requested)
    $profile = null;
    if ($include_profile) {
        // DB2 User Check
        $stmtP = $db2->prepare("SELECT id, user_name as name, user_email as email, user_mobile as phone, user_role as role, user_current_status as status, user_profile, created_at FROM users WHERE id = ?");
        $stmtP->bind_param("i", $other_id);
        $stmtP->execute();
        $resP = $stmtP->get_result();
        
        if ($rowP = $resP->fetch_assoc()) {
            $profile = $rowP;
            $profile['source'] = 'client';
        } else {
            // DB1 Agent Check
            $db1 = db();
            $stmtA = $db1->prepare("SELECT id, user_name as name, user_email as email, user_mobile as phone, 'agent' as role, user_status as status, created_at FROM calling_team WHERE id = ?");
            $stmtA->bind_param("i", $other_id);
            $stmtA->execute();
            $resA = $stmtA->get_result();
            if ($rowA = $resA->fetch_assoc()) {
                $profile = $rowA;
                $profile['source'] = 'agent';
            }
        }
    }
    
    echo json_encode([
        'messages' => $messages,
        'user_profile' => $profile,
        'read_marked' => $mark_read
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
