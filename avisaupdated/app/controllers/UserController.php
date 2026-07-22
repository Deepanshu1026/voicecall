<?php

require_once __DIR__ . '/../helpers/session.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../helpers/email.php';

class UserController
{

    public function createUser($data)
    {
        // Must start session BEFORE checking role
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // Only admin or manager can create users
        if (!isset($_SESSION['user_id']) || !in_array($_SESSION['role'], ['admin', 'manager'])) {
            return ["success" => false, "error" => "Unauthorized"];
        }

        $name  = trim($data['name'] ?? '');
        $email = trim($data['email'] ?? '');
        $phone = trim($data['phone'] ?? '');
        $role  = trim($data['role'] ?? 'employee');

        if ($name === '' || $email === '') {
            return ["success" => false, "error" => "Name and email required"];
        }

        // Check if email already exists
        $userModel = new User();
        $existing = $userModel->findByEmail($email);
        if ($existing) {
            return ["success" => false, "error" => "Email already exists"];
        }

        // Generate temp password (8 random characters)
        $tempPassword = bin2hex(random_bytes(4));
        $hashedPassword = password_hash($tempPassword, PASSWORD_BCRYPT);

        // Create user
        $userId = $userModel->create($name, $email, $phone, $role, $hashedPassword);

        if (!$userId) {
            return ["success" => false, "error" => "Failed to create user"];
        }

        // Send login details email
        $subject = "Welcome to Avisa Experts Portal";
        $body = "
            <h2>Welcome to Avisa Experts Portal</h2>
            <p>Hello <strong>$name</strong>,</p>
            <p>Your account has been created successfully.</p>
            <p><strong>Email:</strong> $email</p>
            <p><strong>Temporary Password:</strong> $tempPassword</p>
            <p><strong>Role:</strong> $role</p>
            <br>
            <p>Login at: <a href='http://localhost/avisaexperts-portal'>http://localhost/avisaexperts-portal</a></p>
            <p>Please change your password after first login.</p>
        ";

        $emailStatus = "Email not configured";
        
        if (function_exists('send_email')) {
            $emailResult = send_email($email, $name, $subject, $body);
            
            if ($emailResult === true) {
                $emailStatus = "Email sent successfully";
            } else {
                $emailStatus = "Email failed: " . (is_string($emailResult) ? $emailResult : "Unknown error");
            }
        }

        return [
            "success" => true,
            "user_id" => $userId,
            "temp_password" => $tempPassword,
            "email_status" => $emailStatus,
            "message" => "User created successfully"
        ];
    }

    public function requestCompletion($caseId)
{
    if (session_status() === PHP_SESSION_NONE) session_start();

    $userId = $_SESSION['user_id'] ?? null;
    $role   = $_SESSION['role'] ?? null;

    if (!$userId || $role !== "employee") {
        return ["error" => "Only employees can request completion"];
    }

    $caseModel = new CaseModel();
    $case = $caseModel->findById($caseId);

    if (!$case) return ["error" => "Case not found"];

    if ((int)$case['assigned_employee'] !== (int)$userId) {
        return ["error" => "This case is not assigned to you"];
    }

    if ($case['status'] !== "in-progress") {
        return ["error" => "You can only request completion for cases that are in-progress"];
    }

    // Change the status
    $caseModel->updateStatus($caseId, "awaiting-completion-approval");

    // Log activity
    log_case_activity($caseId, $userId, "case_completion_requested", ["by"=>$userId]);

    // Notify manager
    if ($case["assigned_manager"]) {
        send_firebase_notification("user_" . $case["assigned_manager"], [
            "title" => "Completion Requested",
            "body"  => "Employee requested case completion for Case #$caseId"
        ]);
    }

    return [
        "success" => true,
        "message" => "Completion request sent",
        "new_status" => "awaiting-completion-approval"
    ];
}
}
