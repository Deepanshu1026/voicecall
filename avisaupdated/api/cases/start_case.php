<?php
require_once __DIR__ . '/../../app/helpers/session.php';
require_once __DIR__ . '/../../app/helpers/auth.php';
require_once __DIR__ . '/../../app/controllers/CaseController.php';

require_auth();

if ($_SESSION['role'] !== 'employee') {
    echo json_encode(["error" => "Only employees can start cases"]);
    exit;
}

if (!isset($_POST['case_id'])) {
    echo json_encode(["error" => "case_id required"]);
    exit;
}

$caseId = intval($_POST['case_id']);

$controller = new CaseController();
$result = $controller->startCase($caseId);

echo json_encode($result);
