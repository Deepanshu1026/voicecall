<?php
require_once __DIR__ . '/../../app/helpers/auth.php';
require_once __DIR__ . '/../../app/helpers/db.php';
require_once __DIR__ . '/../../app/helpers/db2.php';

require_auth();

$user_id = (int) $_SESSION['user_id'];

header('Content-Type: application/json');

try {
    $db2 = db2();

    /* =========================================
       STEP 1: GET RECENT CONVERSATIONS
       ========================================= */
    $sql = "
        SELECT 
            CASE 
                WHEN sender_id = ? THEN receiver_id 
                ELSE sender_id 
            END AS other_id,
            MAX(created_at) AS last_time
        FROM messages
        WHERE sender_id = ? OR receiver_id = ?
        GROUP BY other_id
        ORDER BY last_time DESC
    ";

    $stmt = $db2->prepare($sql);
    $stmt->bind_param("iii", $user_id, $user_id, $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $conversations_raw = [];
    $other_ids = [];

    while ($row = $result->fetch_assoc()) {
        $conversations_raw[$row['other_id']] = $row['last_time'];
        $other_ids[] = (int)$row['other_id'];
    }

    if (empty($other_ids)) {
        echo json_encode(['conversations' => []]);
        exit;
    }

    /* =========================================
       STEP 2: UNREAD COUNTS
       ========================================= */
    $unread_map = [];
    $sql_unread = "
        SELECT sender_id, COUNT(*) AS cnt 
        FROM messages 
        WHERE receiver_id = ? AND is_read = 'no'
        GROUP BY sender_id
    ";

    $stmt_ur = $db2->prepare($sql_unread);
    $stmt_ur->bind_param("i", $user_id);
    $stmt_ur->execute();
    $res_ur = $stmt_ur->get_result();

    while ($row = $res_ur->fetch_assoc()) {
        $unread_map[$row['sender_id']] = (int)$row['cnt'];
    }

    /* =========================================
       STEP 3: LAST MESSAGE PER CONVERSATION
       ========================================= */
    $ids_list = implode(',', $other_ids);

    $last_messages = [];
    $sql_last = "
        SELECT 
            sender_id,
            receiver_id,
            message,
            created_at
        FROM messages
        WHERE 
            (sender_id = $user_id AND receiver_id IN ($ids_list))
            OR
            (receiver_id = $user_id AND sender_id IN ($ids_list))
        ORDER BY created_at DESC
    ";

    $res_last = $db2->query($sql_last);

    while ($row = $res_last->fetch_assoc()) {
        $oid = ($row['sender_id'] == $user_id) 
            ? $row['receiver_id'] 
            : $row['sender_id'];

        if (!isset($last_messages[$oid])) {
            $last_messages[$oid] = [
                'text' => $row['message'],
                'time' => $row['created_at'],
                'sender_id' => $row['sender_id']
            ];
        }
    }

    /* =========================================
       STEP 4: FETCH USER DETAILS
       ========================================= */
    $db1 = db();
    $users_map = [];

    // DB2 users
    $sql_u = "SELECT id, user_name, user_role FROM users WHERE id IN ($ids_list)";
    $res_u = $db2->query($sql_u);
    if ($res_u) {
        while ($row = $res_u->fetch_assoc()) {
            $users_map[$row['id']] = [
                'name' => $row['user_name'],
                'role' => $row['user_role']
            ];
        }
    }

    // DB1 calling_team fallback
    $missing_ids = array_diff($other_ids, array_keys($users_map));
    if (!empty($missing_ids)) {
        $missing_list = implode(',', $missing_ids);
        $sql_ct = "SELECT id, user_name FROM calling_team WHERE id IN ($missing_list)";
        $res_ct = $db1->query($sql_ct);
        if ($res_ct) {
            while ($row = $res_ct->fetch_assoc()) {
                $users_map[$row['id']] = [
                    'name' => $row['user_name'],
                    'role' => 'agent'
                ];
            }
        }
    }

    /* =========================================
       STEP 5: FINAL RESPONSE
       ========================================= */
    $conversations = [];

    foreach ($other_ids as $oid) {
        $user = $users_map[$oid] ?? ['name'=>"Unknown ($oid)", 'role'=>'unknown'];
        $last = $last_messages[$oid] ?? null;

        $conversations[] = [
            'id' => $oid,
            'name' => $user['name'],
            'role' => $user['role'],
            'last_message' => $last['text'] ?? '',
            'last_message_time' => $last['time'] ?? null,
            'last_sender_id' => $last['sender_id'] ?? null,
            'unread' => $unread_map[$oid] ?? 0
        ];
    }

    echo json_encode(['conversations' => $conversations]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
