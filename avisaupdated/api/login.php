<?php
require_once __DIR__ . '/../app/helpers/session.php';
require_once __DIR__ . '/../app/controllers/AuthController.php';

$auth = new AuthController();
echo json_encode($auth->login());
