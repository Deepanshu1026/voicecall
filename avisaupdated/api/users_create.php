<?php
// Clean all output buffers first
while (ob_get_level()) {
    ob_end_clean();
}

// Start fresh output buffering
ob_start();

require_once __DIR__ . '/../app/helpers/session.php';
require_once __DIR__ . '/../app/helpers/auth.php';
require_once __DIR__ . '/../app/helpers/db.php';
require_once __DIR__ . '/../app/helpers/email.php'; // Use your email helper

// Clean buffer and set JSON header
ob_clean();
header('Content-Type: application/json; charset=utf-8');

try {
    // Check authentication
    require_auth();

    if ($_SESSION['role'] !== 'admin') {
        ob_end_clean();
        die(json_encode(["success" => false, "error" => "Only admins can create users"]));
    }

    // Validate input
    if (!isset($_POST['name']) || !isset($_POST['email']) || !isset($_POST['role'])) {
        ob_end_clean();
        die(json_encode(["success" => false, "error" => "Missing required fields: name, email, role"]));
    }

    $name = trim($_POST['name']);
    $email = trim($_POST['email']);
    $phone = trim($_POST['phone'] ?? '');
    $role = trim($_POST['role']);

    if (empty($name) || empty($email) || empty($role)) {
        ob_end_clean();
        die(json_encode(["success" => false, "error" => "Name, email and role are required"]));
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        ob_end_clean();
        die(json_encode(["success" => false, "error" => "Invalid email format"]));
    }

    if (!in_array($role, ['employee', 'manager', 'admin', 'agent'])) {
        ob_end_clean();
        die(json_encode(["success" => false, "error" => "Invalid role. Must be: employee, manager, admin, or agent"]));
    }

    $db = db();
    
    // Check if email already exists in users (since users table takes precedence in login)
    $checkStmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $checkStmt->bind_param("s", $email);
    $checkStmt->execute();
    if ($checkStmt->get_result()->num_rows > 0) {
        ob_end_clean();
        die(json_encode(["success" => false, "error" => "Email already exists in Users"]));
    }
    $checkStmt->close();

    // Check if email already exists in calling_team
    $checkStmt2 = $db->prepare("SELECT id FROM calling_team WHERE user_email = ?");
    $checkStmt2->bind_param("s", $email);
    $checkStmt2->execute();
    if ($checkStmt2->get_result()->num_rows > 0) {
        ob_end_clean();
        die(json_encode(["success" => false, "error" => "Email already exists in Calling Team"]));
    }
    $checkStmt2->close();
    
    // Generate temporary password
    $namePart = preg_replace('/[^a-zA-Z0-9]/', '', explode(' ', $name)[0]);
    if (empty($namePart)) $namePart = 'User';
    $tempPassword = "ave_".ucfirst(strtolower($namePart));
    $hashedPassword = password_hash($tempPassword, PASSWORD_BCRYPT);
    
    $userId = 0;

    if ($role === 'agent') {
        // Insert into calling_team
        // Assuming columns: id, user_name, user_email, user_password, user_status
        $stmt = $db->prepare("INSERT INTO calling_team (user_name, user_email, user_mobile, user_password, user_status) VALUES (?, ?, ?, ?, 'Enable')");
        $stmt->bind_param("ssss", $name, $email, $phone, $hashedPassword);
        
        if (!$stmt->execute()) {
            throw new Exception("Failed to create agent in calling_team: " . $stmt->error);
        }
        $userId = $db->insert_id;
    } else {
        // Insert into users
        $stmt = $db->prepare("INSERT INTO users (name, email, phone, password, role, status) VALUES (?, ?, ?, ?, ?, 'active')");
        $stmt->bind_param("sssss", $name, $email, $phone, $hashedPassword, $role);
        
        if (!$stmt->execute()) {
            throw new Exception("Failed to create user in database: " . $stmt->error);
        }
        $userId = $db->insert_id;
    }
    
    // Try to send email using your email.php helper
    $emailStatus = "Email not configured";
    
    if (function_exists('send_email')) {
        $subject = "Welcome to Avisa Experts Portal";
        $body = "
            <h2>Welcome to Avisa Experts Portal</h2>
            <p>Hello <strong>{$name}</strong>,</p>
            <p>Your account has been created with the following credentials:</p>
            <p><strong>Email:</strong> {$email}</p>
            <p><strong>Temporary Password:</strong> {$tempPassword}</p>
            <p><strong>Role:</strong> {$role}</p>
            <p>Please login at: <a href='http://portal.avisaexperts.com/'>http://portal.avisaexperts.com/</a></p>
            <p>Please change your password after first login.</p>
        ";
        
        $emailResult = send_email($email, $subject, $body);
        
        if ($emailResult === true) {
            $emailStatus = "Email sent successfully";
        } else {
            $emailStatus = "Email failed: " . (is_string($emailResult) ? $emailResult : "Unknown error");
        }
    }
    
    // Always return success if user was created (even if email fails)
    ob_end_clean();
    echo json_encode([
        "success" => true,
        "user_id" => $userId,
        "temp_password" => $tempPassword,
        "email_status" => $emailStatus,
        "message" => "User created successfully"
    ]);
    
} catch (Exception $e) {
    ob_end_clean();
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
?>
