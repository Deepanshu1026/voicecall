<?php
require_once __DIR__ . '/../app/helpers/session.php';
require_once __DIR__ . '/../app/controllers/CaseController.php';

if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'employee') {
    echo json_encode(["error" => "Only employees can view their cases"]);
    exit;
}

$employeeId = $_SESSION['user_id'];

$caseCtrl = new CaseController();
echo json_encode($caseCtrl->getEmployeeCases($employeeId));
