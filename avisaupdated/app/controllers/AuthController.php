<?php

require_once __DIR__ . '/../helpers/db.php';
require_once __DIR__ . '/../helpers/db2.php';

class AuthController {

    /* ===============================
       UNIVERSAL PASSWORD CHECK
    =============================== */
  private function verifyPassword($inputPassword, $storedPassword)
{
    // 1️⃣ BCRYPT / ARGON (starts with $)
    if (str_starts_with($storedPassword, '$2y$') || 
        str_starts_with($storedPassword, '$argon2')) {
        return password_verify($inputPassword, $storedPassword);
    }

    // 2️⃣ SHA1 (40 char hex)
    if (strlen($storedPassword) === 40 && ctype_xdigit($storedPassword)) {
        return sha1($inputPassword) === $storedPassword;
    }

    // 3️⃣ PLAIN TEXT
    return $inputPassword === $storedPassword;
}


    public function login()
    {
        if (session_status() === PHP_SESSION_NONE) session_start();

        $email    = $_POST['email'] ?? null;
        $password = $_POST['password'] ?? null;

        if (!$email || !$password) {
            return ["error" => "Missing email or password"];
        }

        $db = db();

        /* ===============================
           1️⃣ USERS TABLE
        =============================== */
        $stmt = $db->prepare(
            "SELECT id, name, role, status, password 
             FROM users 
             WHERE email = ? 
             LIMIT 1"
        );
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $user = $stmt->get_result()->fetch_assoc();

        if ($user) {

            if ($user['status'] !== 'active') {
                return ["error" => "Account not active"];
            }

            if (!$this->verifyPassword($password, $user['password'])) {
                return ["error" => "Invalid credentials"];
            }

            // 🔐 Auto-upgrade password to bcrypt
            if (password_get_info($user['password'])['algo'] === 0) {
                $newHash = password_hash($password, PASSWORD_BCRYPT);
                $up = $db->prepare("UPDATE users SET password = ? WHERE id = ?");
                $up->bind_param("si", $newHash, $user['id']);
                $up->execute();
            }

            $_SESSION['user_id']   = $user['id'];
            $_SESSION['user_name'] = $user['name'];
            $_SESSION['role']      = $user['role'];

            return [
                "success" => true,
                "user" => [
                    "id"   => $user['id'],
                    "name" => $user['name'],
                    "role" => $user['role']
                ]
            ];
        }

        /* ===============================
           2️⃣ CALLING TEAM
        =============================== */
        $stmt = $db->prepare(
            "SELECT id, user_name, user_status, user_password 
             FROM calling_team 
             WHERE user_email = ? 
             LIMIT 1"
        );
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $team = $stmt->get_result()->fetch_assoc();

        if ($team) {

            if ($team['user_status'] !== 'Enable') {
                return ["error" => "Account not active"];
            }

            if (!$this->verifyPassword($password, $team['user_password'])) {
                return ["error" => "Invalid credentials"];
            }

            // 🔐 Auto-upgrade password
            if (password_get_info($team['user_password'])['algo'] === 0) {
                $newHash = password_hash($password, PASSWORD_BCRYPT);
                $up = $db->prepare("UPDATE calling_team SET user_password = ? WHERE id = ?");
                $up->bind_param("si", $newHash, $team['id']);
                $up->execute();
            }

            $_SESSION['user_id']         = $team['id'];
            $_SESSION['user_name']       = $team['user_name'];
            $_SESSION['role']            = 'agent';
            $_SESSION['is_calling_team'] = true;

            // update live status in DB2
            $this->updateDB2Status($team['id'], 'Active');

            return [
                "success" => true,
                "user" => [
                    "id"   => $team['id'],
                    "name" => $team['user_name'],
                    "role" => 'agent'
                ]
            ];
        }

        return ["error" => "Invalid credentials"];
    }

    public function logout()
    {
        if (session_status() === PHP_SESSION_NONE) session_start();

        if (!empty($_SESSION['is_calling_team'])) {
            $this->updateDB2Status($_SESSION['user_id'], 'Unavailable');
        }

        session_destroy();
    }

    private function updateDB2Status($userId, $status)
    {
        try {
            $db2 = db2();
            $stmt = $db2->prepare(
                "UPDATE users 
                 SET user_current_status = ? 
                 WHERE id = ?"
            );
            $stmt->bind_param("si", $status, $userId);
            $stmt->execute();
        } catch (Exception $e) {
            error_log("DB2 update failed: " . $e->getMessage());
        }
    }
}
