<?php
require_once __DIR__ . '/../../app/controllers/CaseController.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

$caseId = $_POST['case_id'] ?? 0;

if (!$caseId) {
    echo json_encode(["error" => "Case ID required"]);
    exit;
}

$controller = new CaseController();
echo json_encode($controller->rejectDocs($caseId));
?>
