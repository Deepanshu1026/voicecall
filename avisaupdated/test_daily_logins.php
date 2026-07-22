<?php
session_start();
$_SESSION['role'] = 'admin'; 
$_SESSION['user_id'] = 1; // Mock user ID

require_once __DIR__ . '/app/controllers/AdminController.php';

$ctrl = new AdminController();
$response = $ctrl->getDailyLogins();

echo "Success: " . ($response['success'] ? 'Yes' : 'No') . "\n";
echo "Count: " . count($response['data']) . "\n";
if (!empty($response['data'])) {
    print_r($response['data'][0]);
}
?>
