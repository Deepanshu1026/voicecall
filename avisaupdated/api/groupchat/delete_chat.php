<?php
require_once __DIR__ . '/../../app/controllers/ChatController.php';

header('Content-Type: application/json');

$controller = new ChatController();
echo json_encode($controller->deleteChat());
