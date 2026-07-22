<?php
require_once __DIR__ . '/session.php';

/**
 * Verify user is logged in
 */
function require_auth()
{
    if (!isset($_SESSION['user_id'])) {
        if (is_api_request()) {
            header('Content-Type: application/json');
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Not authenticated']);
            exit;
        }
        header("Location: /avisaexperts-portal/public/login.php");
        exit;
    }
}

/**
 * Verify user has required role
 */
function require_role($role)
{
    if (!isset($_SESSION['role']) || $_SESSION['role'] !== $role) {
        if (is_api_request()) {
            header('Content-Type: application/json');
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Insufficient permissions']);
            exit;
        }
        echo "Access denied: insufficient permissions";
        exit;
    }
}

/**
 * Check if the current request is an API request
 */
function is_api_request()
{
    $path = $_GET['path'] ?? '';
    if (strpos($path, 'api/') === 0) {
        return true;
    }

    $requestUri = $_SERVER['REQUEST_URI'] ?? '';
    if (strpos($requestUri, '/api/') !== false) {
        return true;
    }

    if (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false) {
        return true;
    }

    return false;
}
