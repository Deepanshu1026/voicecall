<?php

require_once __DIR__ . '/../app/helpers/session.php';
require_once __DIR__ . '/../app/controllers/AuthController.php';

$auth = new AuthController();
$auth->logout();

session_unset();
session_destroy();

echo json_encode(["success" => true, "message" => "Logged out"]);
