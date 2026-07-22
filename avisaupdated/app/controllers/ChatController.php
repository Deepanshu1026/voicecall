<?php
require_once __DIR__ . '/../helpers/db.php';
require_once __DIR__ . '/../helpers/auth.php';

class ChatController
{
    private $db;

    public function __construct()
    {
        date_default_timezone_set('Asia/Kolkata');
        $this->db = db();
    }

    public function sendMessage()
    {
        // Debug Logging - Moved to public/uploads since root is read-only
        $logDir = __DIR__ . '/../../public/uploads/';
        if (!is_dir($logDir)) { @mkdir($logDir, 0755, true); }
        $logFile = $logDir . 'chat_debug.txt';
        
        $logEntry = date('Y-m-d H:i:s') . " - Request Received\n";
        
        require_auth();
        $senderId = $_SESSION['user_id'];
        
        // Try JSON input first
        $input = json_decode(file_get_contents('php://input'), true);
        
        // If not JSON, check $_POST (for FormData/multipart)
        if (!$input && !empty($_POST)) {
            $input = $_POST;
        }

        // Log Inputs
        $logEntry .= "POST Data: " . print_r($_POST, true) . "\n";
        $logEntry .= "FILES Data: " . print_r($_FILES, true) . "\n";
        
        if (!$input || (empty($input['message']) && empty($_FILES['file']['name']))) {
            $logEntry .= "Error: No message or file\n";
            file_put_contents($logFile, $logEntry, FILE_APPEND);
            return ['error' => 'Message or file is required'];
        }

        $message = isset($input['message']) ? trim($input['message']) : '';
        $receiverId = !empty($input['receiver_id']) && $input['receiver_id'] !== 'null' ? $input['receiver_id'] : null;
        $attachment = null;

        // Handle File Upload
        if (!empty($_FILES['file']['name'])) {
            $allowed = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'txt']; // Added txt support
            $filename = $_FILES['file']['name'];
            $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
            
            if (!in_array($ext, $allowed)) {
                $logEntry .= "Error: Invalid file type ($ext)\n";
                file_put_contents($logFile, $logEntry, FILE_APPEND);
                return ['error' => 'Invalid file type. Allowed: jpg, png, pdf, doc'];
            }
            
            // Validate size (e.g., 5MB)
            if ($_FILES['file']['size'] > 5 * 1024 * 1024) {
                return ['error' => 'File size too large (Max 5MB)'];
            }

            $uploadDir = __DIR__ . '/../../public/uploads/chat/';
            if (!is_dir($uploadDir)) {
                if (!mkdir($uploadDir, 0755, true)) { // Changed to 0755 for shared host compatibility
                    $logEntry .= "Error: Failed to create directory $uploadDir\n";
                    file_put_contents($logFile, $logEntry, FILE_APPEND);
                    return ['error' => 'Server Configuration Error: Cannot create upload directory'];
                }
            }

            $newFilename = uniqid('chat_') . '.' . $ext;
            $destination = $uploadDir . $newFilename;

            if (move_uploaded_file($_FILES['file']['tmp_name'], $destination)) {
                $attachment = 'public/uploads/chat/' . $newFilename;
                $logEntry .= "Success: File uploaded to $attachment\n";
            } else {
                $sysError = error_get_last();
                $logEntry .= "Error: move_uploaded_file failed\n";
                $logEntry .= "System Message: " . ($sysError['message'] ?? 'Unknown Error') . "\n";
                $logEntry .= "Destination: " . $destination . "\n";
                
                // Fallback Log to Temp Dir if we can't write to target
                $fallbackLog = sys_get_temp_dir() . '/avisa_chat_error.txt';
                @file_put_contents($fallbackLog, $logEntry, FILE_APPEND);
                
                // Still try to write to main log
                @file_put_contents($logFile, $logEntry, FILE_APPEND);
                
                return ['error' => 'Failed to upload file. Check server logs. System says: ' . ($sysError['message'] ?? '')];
            }
        }

        $currentDate = new DateTime('now', new DateTimeZone('Asia/Kolkata'));
        $createdAt = $currentDate->format('Y-m-d H:i:s');

        $stmt = $this->db->prepare("INSERT INTO messages (sender_id, receiver_id, message, attachment, created_at) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("iisss", $senderId, $receiverId, $message, $attachment, $createdAt);

        if ($stmt->execute()) {
            file_put_contents($logFile, $logEntry, FILE_APPEND);
            return ['success' => true, 'id' => $stmt->insert_id, 'attachment' => $attachment];
        } else {
            $logEntry .= "DB Error: " . $stmt->error . "\n";
            file_put_contents($logFile, $logEntry, FILE_APPEND);
            return ['error' => 'Failed to send message: ' . $stmt->error];
        }
    }

    public function getMessages()
    {
        require_auth();
        $currentUserId = $_SESSION['user_id'];
        
        $receiverId = isset($_GET['receiver_id']) && $_GET['receiver_id'] !== 'null' ? $_GET['receiver_id'] : null;
        $lastId = isset($_GET['last_id']) ? intval($_GET['last_id']) : 0;

        if ($receiverId) {
            // Private Chat: (Me -> You) OR (You -> Me)
            $sql = "SELECT m.*, 
                           COALESCE(u.name, ct.user_name, 'Unknown') as sender_name,
                           ct.user_profile as sender_profile
                    FROM messages m
                    LEFT JOIN users u ON m.sender_id = u.id
                    LEFT JOIN calling_team ct ON m.sender_id = ct.id
                    WHERE m.id > ? 
                    AND (
                        (m.sender_id = ? AND m.receiver_id = ?) 
                        OR 
                        (m.sender_id = ? AND m.receiver_id = ?)
                    )
                    ORDER BY m.created_at ASC";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bind_param("iiiii", $lastId, $currentUserId, $receiverId, $receiverId, $currentUserId);
            
            // Mark incoming private messages as read
            // (Where sender is the partner AND receiver is Me)
            $updateSql = "UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0";
            $updateStmt = $this->db->prepare($updateSql);
            $updateStmt->bind_param("ii", $receiverId, $currentUserId);
            $updateStmt->execute();
            
        } else {
            // Broadcast Chat: receiver_id IS NULL
            $sql = "SELECT m.*, 
                           COALESCE(u.name, ct.user_name, 'Unknown') as sender_name,
                           ct.user_profile as sender_profile
                    FROM messages m
                    LEFT JOIN users u ON m.sender_id = u.id
                    LEFT JOIN calling_team ct ON m.sender_id = ct.id
                    WHERE m.id > ? 
                    AND m.receiver_id IS NULL
                    ORDER BY m.created_at ASC";
            
            $stmt = $this->db->prepare($sql);
            $stmt->bind_param("i", $lastId);
        }

        $stmt->execute();
        $result = $stmt->get_result();
        
        $messages = [];
        while ($row = $result->fetch_assoc()) {
            $row['is_me'] = ($row['sender_id'] == $currentUserId);
            // Format time in Asia/Kolkata
            $date = new DateTime($row['created_at'], new DateTimeZone('UTC')); // Assuming DB stores as UTC, or server time. 
            // Better to assume server time is consistent but we force conversion to display time
            // If DB is already IST, just formatting is separate.
            // Let's rely on the controller constructor setting default timezone, effectively handling `date()` calls.
            // But `strtotime` uses current default timezone.
            // Let's be explicit:
            $date = new DateTime($row['created_at']);
            $date->setTimezone(new DateTimeZone('Asia/Kolkata'));
            $row['time_formatted'] = $date->format('h:i A');
            $messages[] = $row;
        }

        return ['success' => true, 'messages' => $messages];
    }

    public function getUsers()
    {
        require_auth();
        $currentUserId = $_SESSION['user_id'];

        // Fetch Users (Admins, Agents, etc.) + Calling Team
        // Exclude current user from the list
        
        $users = [];
        
        // 1. Fetch from 'users' table
        // users table (DB1) does not have user_profile, so we return NULL or check if it exists in another table
        $sqlUsers = "SELECT id, name, role, NULL as user_profile, 'user' as type FROM users WHERE id != ?";
        $stmt = $this->db->prepare($sqlUsers);
        $stmt->bind_param("i", $currentUserId);
        $stmt->execute();
        $res = $stmt->get_result();
        while($row = $res->fetch_assoc()) {
            $users[] = $row;
        }

        // 2. Fetch from 'calling_team' table
        $sqlTeam = "SELECT id, user_name as name, user_profile, 'calling_team' as role, 'team' as type FROM calling_team WHERE id != ?";
        
        $stmt2 = $this->db->prepare($sqlTeam);
        $stmt2->bind_param("i", $currentUserId);
        $stmt2->execute();
        $res2 = $stmt2->get_result();
        while($row = $res2->fetch_assoc()) {
             $users[] = $row;
        }

        // 3. Attach metadata (Unread Count & Last Msg Time) for sorting
        foreach ($users as &$u) {
            // Unread Count
            $sqlUnread = "SELECT COUNT(*) as cnt FROM messages WHERE sender_id = ? AND receiver_id = ? AND is_read = 0";
            $stmtU = $this->db->prepare($sqlUnread);
            $stmtU->bind_param("ii", $u['id'], $currentUserId);
            $stmtU->execute();
            $u['unread'] = $stmtU->get_result()->fetch_assoc()['cnt'];

            // Last Message Time (Sent or Received)
            $sqlLast = "SELECT created_at FROM messages 
                        WHERE (sender_id = ? AND receiver_id = ?) 
                           OR (sender_id = ? AND receiver_id = ?) 
                        ORDER BY id DESC LIMIT 1";
            $stmtL = $this->db->prepare($sqlLast);
            $stmtL->bind_param("iiii", $u['id'], $currentUserId, $currentUserId, $u['id']);
            $stmtL->execute();
            $lastRow = $stmtL->get_result()->fetch_assoc();
            $u['last_msg_time'] = $lastRow ? $lastRow['created_at'] : null;
        }

        // Sort: High unread first, then recent time
        usort($users, function($a, $b) {
            if ($a['unread'] != $b['unread']) {
                return $b['unread'] - $a['unread']; // Higher unread first
            }
            if ($a['last_msg_time'] != $b['last_msg_time']) {
                return strtotime($b['last_msg_time'] ?? 0) - strtotime($a['last_msg_time'] ?? 0); // Newer time first
            }
            return 0; 
        });

        return ['success' => true, 'users' => $users];
    }
    public function getClients()
    {
        require_auth();
        $currentUserId = $_SESSION['user_id'];
        
        // Fetch only Clients (role = 'user')
        $users = [];
        $sql = "SELECT id, name, role, 'user' as type FROM users WHERE role = 'user' AND id != ?";
        
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param("i", $currentUserId);
        $stmt->execute();
        $res = $stmt->get_result();
        
        while($row = $res->fetch_assoc()) {
            // Count unread messages for this user
            $countSql = "SELECT COUNT(*) as total FROM messages WHERE sender_id = ? AND receiver_id = ? AND is_read = 0";
            $countStmt = $this->db->prepare($countSql);
            $countStmt->bind_param("ii", $row['id'], $currentUserId);
            $countStmt->execute();
            $row['unread'] = $countStmt->get_result()->fetch_assoc()['total'];
            
            $users[] = $row;
        }

        return ['success' => true, 'clients' => $users];
    }

    public function deleteChat()
    {
        require_auth();
        $currentUserId = $_SESSION['user_id'];
        
        $receiverId = !empty($_POST['receiver_id']) && $_POST['receiver_id'] !== 'null' ? $_POST['receiver_id'] : null;

        if ($receiverId) {
            // Private Chat: Delete messages between Me and Partner
            $sql = "DELETE FROM messages 
                    WHERE (sender_id = ? AND receiver_id = ?) 
                       OR (sender_id = ? AND receiver_id = ?)";
            $stmt = $this->db->prepare($sql);
            $stmt->bind_param("iiii", $currentUserId, $receiverId, $receiverId, $currentUserId);
        } else {
            // Broadcast Chat: Delete all messages where receiver_id is NULL
            // Note: For broadcast, we just delete all.
            $sql = "DELETE FROM messages WHERE receiver_id IS NULL";
            $stmt = $this->db->prepare($sql);
        }

        if ($stmt->execute()) {
            return ['success' => true];
        } else {
            return ['error' => 'Failed to delete chat: ' . $stmt->error];
        }
    }

    public function deleteSingleMessage()
    {
        require_auth();
        $currentUserId = $_SESSION['user_id'];
        
        $messageId = isset($_POST['message_id']) ? intval($_POST['message_id']) : 0;

        if (!$messageId) {
            return ['error' => 'Message ID is required'];
        }

        // Allow deleting only own messages for now
        $sql = "DELETE FROM messages WHERE id = ? AND sender_id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param("ii", $messageId, $currentUserId);

        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                return ['success' => true];
            } else {
                return ['error' => 'Message not found or you are not authorized to delete it'];
            }
        } else {
            return ['error' => 'Failed to delete message: ' . $stmt->error];
        }
    }
}
