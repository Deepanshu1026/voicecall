<?php
require_once __DIR__ . '/../app/helpers/session.php';
require_once __DIR__ . '/../app/models/CaseDocumentModel.php';

$caseId = $_GET['case_id'] ?? null;

if (!$caseId) {
    echo json_encode(["error" => "case_id required"]);
    exit;
}

$docModel = new CaseDocumentModel();
$docs = $docModel->getDocumentsByCase($caseId);

echo json_encode(["success" => true, "documents" => $docs]);
