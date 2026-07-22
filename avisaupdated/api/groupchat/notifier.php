<?php
require_once __DIR__ . '/../../app/helpers/db.php';
require_once __DIR__ . '/../../app/helpers/auth.php';

if (session_status() === PHP_SESSION_NONE) session_start();
$userId = $_SESSION['user_id'] ?? 0;

if (!$userId) {
    echo json_encode(['success' => false, 'count' => 0]);
    exit;
}

$db = db();

// Logic:
// Group/Broadcast messages have receiver_id IS NULL.
// We need to count how many of these exist that are NEWER than the last time the user checked the group chat.
// However, typically "unread" for a public group is hard to track per-user without a 'read_receipts' table.
// A simpler approach for now is:
// 1. Count private unread (receiver_id = me AND is_read = 0)
// 2. Determine "unread group messages". 
//    Without a persistent "last_read_group_time" for every user, we can't easily show a count.
//    BUT, checking the original request, the user likely just wants the total unread count endpoint to be separate.
//    
// Let's implement the standard unread count here first:

$count = 0;

// 1. Private Unread
$stmt = $db->prepare("SELECT COUNT(*) as total FROM messages WHERE receiver_id = ? AND is_read = 0");
$stmt->bind_param("i", $userId);
$stmt->execute();
$privateCount = $stmt->get_result()->fetch_assoc()['total'];

// 2. Group Unread (Client-side tracking)
$lastSeenGroupId = isset($_GET['last_group_id']) ? intval($_GET['last_group_id']) : 0;
$groupCount = 0;

if ($lastSeenGroupId > 0) {
    // Count messages sent to group (receiver_id IS NULL or 0) that are newer than what user saw
    // AND were NOT sent by the user themselves
    $stmtGroup = $db->prepare("SELECT COUNT(*) as total FROM messages WHERE (receiver_id IS NULL OR receiver_id = 0) AND id > ? AND sender_id != ?");
    $stmtGroup->bind_param("ii", $lastSeenGroupId, $userId);
    $stmtGroup->execute();
    $groupCount = $stmtGroup->get_result()->fetch_assoc()['total'];
}

$totalCount = $privateCount + $groupCount;

echo json_encode([
    'success' => true, 
    'count' => $totalCount, // Backward compatibility for topbar
    'private_count' => $privateCount,
    'group_count' => $groupCount
]);
