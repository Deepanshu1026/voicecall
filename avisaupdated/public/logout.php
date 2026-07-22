<?php
require_once __DIR__ . '/../app/helpers/session.php';

require_once __DIR__ . '/../app/controllers/AuthController.php';
$auth = new AuthController();
$auth->logout();

// Destroy everything
$_SESSION = [];
session_unset();
session_destroy();

// Prevent caching after logout
header("Cache-Control: no-cache, must-revalidate");
header("Expires: 0");

// Redirect to login page
header("Location: login.php");
exit;
?>
