<?php

// Start session ONLY if it is not started yet
if (session_status() === PHP_SESSION_NONE) {

    // Use a project-local session folder to avoid XAMPP tmp permission issues
    $sessionDir = __DIR__ . '/../../sessions';
    if (!is_dir($sessionDir)) {
        @mkdir($sessionDir, 0755, true);
    }
    if (is_dir($sessionDir) && is_writable($sessionDir)) {
        session_save_path($sessionDir);
    }

    // 10 days session lifetime
    session_set_cookie_params([
        'lifetime' => 864000, 
        'path' => '/',
        'httponly' => true,
        'secure' => false, // set true on HTTPS server
        'samesite' => 'Lax'
    ]);

    session_start();
}