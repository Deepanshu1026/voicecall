<?php
require_once __DIR__ . '/../app/helpers/session.php';
require_once __DIR__ . '/../app/controllers/CaseController.php';

if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'employee') {
    echo json_encode(["error" => "Only employees can update status"]);
    exit;
}

$caseId = $_POST['case_id'] ?? null;
$status = $_POST['status'] ?? null;

if (!$caseId || !$status) {
    echo json_encode(["error" => "case_id and status required"]);
    exit;
}

$controller = new CaseController();
echo json_encode($controller->updateStatus((int)$caseId, $status));
