<?php
// Mock Session
session_start();
$_SESSION['user_id'] = 1; // Assuming 1 is admin
$_SESSION['role'] = 'admin';

require_once __DIR__ . '/app/controllers/AgentController.php';

$ctrl = new AgentController();
$response = $ctrl->getAllApplications(null);

print_r($response);
?>
