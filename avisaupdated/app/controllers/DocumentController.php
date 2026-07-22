<?php
require_once __DIR__ . '/../models/CaseDocumentModel.php';
require_once __DIR__ . '/../models/CaseModel.php';
require_once __DIR__ . '/../helpers/activity.php';
require_once __DIR__ . '/../helpers/firebase.php';

class DocumentController
{

    public function listDocuments($caseId)
    {
        $docModel = new CaseDocumentModel();
        $docs = $docModel->getDocumentsByCase($caseId);
        return ["success" => true, "documents" => $docs];
    }

    // Employee marks docs complete (moves case to waiting-doc-approval)
    public function markDocsComplete($caseId)
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    $userId = $_SESSION['user_id'] ?? null;
    $role = $_SESSION['role'] ?? null;

    if (!$userId || $role !== 'employee') {
        return ["error" => "Only employees can mark docs complete"];
    }

    $caseModel = new CaseModel();
    $case = $caseModel->findById($caseId);

    if (!$case) {
        return ["error" => "Case not found"];
    }

    if ((int)$case['assigned_employee'] !== (int)$userId) {
        return ["error" => "This case is not assigned to you"];
    }

    // ONE CASE RULE:
    if ($caseModel->employeeHasActiveCase($userId)) {

        // allow only if THIS case is the one active
        if ($case['status'] !== 'in-progress') {
            return ["error" => "You cannot upload docs for this case while another case is active."];
        }
    }

    // Move to waiting-doc-approval
    $caseModel->setDocsAwaitingApproval($caseId);

    log_case_activity($caseId, $userId, 'docs_marked_complete', ["by" => $userId]);

    // notify manager
    $managerId = $case['assigned_manager'];

    if ($managerId) {
        send_firebase_notification("user_{$managerId}", [
            "title" => "Documents uploaded",
            "body" => "Employee uploaded documents for case #{$caseId}",
            "case_id" => $caseId
        ]);
    }

    return [
        "success" => true,
        "case_id" => $caseId,
        "status" => "waiting-doc-approval"
    ];
}


    // Manager or admin approves docs
    public function approveDocs($caseId)
    {
        if (session_status() === PHP_SESSION_NONE) session_start();

        $userId = $_SESSION['user_id'] ?? null;
        $role   = $_SESSION['role'] ?? null;

        if (!$userId || !in_array($role, ['manager', 'admin'])) {
            return ["error" => "Only manager or admin can approve documents"];
        }

        $caseModel = new CaseModel();
        $case = $caseModel->findById($caseId);
        if (!$case) return ["error" => "Case not found"];

        if ($role === 'manager' && (int)$case['assigned_manager'] !== (int)$userId) {
            return ["error" => "You are not the assigned manager for this case"];
        }

        $caseModel->approveDocs($caseId, $userId);

        log_case_activity($caseId, $userId, 'docs_approved', [
            "approved_by" => $userId
        ]);

        send_firebase_notification("user_" . $case['assigned_employee'], [
            "title" => "Documents Approved",
            "body"  => "Your documents have been approved for case #{$caseId}",
            "case_id" => $caseId
        ]);

        return [
            "success" => true,
            "case_id" => $caseId,
            "new_status" => "in-progress"
        ];
    }


    // Delete doc (admin only) — removes DB record. (Drive file stays: we don't call Drive delete here)
    public function deleteDocument($docId)
    {
        if (session_status() === PHP_SESSION_NONE) session_start();
        $userId = $_SESSION['user_id'] ?? null;
        $role = $_SESSION['role'] ?? null;

        if (!$userId || $role !== 'admin') {
            return ["error" => "Forbidden"];
        }

        $docModel = new CaseDocumentModel();
        $doc = $docModel->getById($docId);
        if (!$doc) return ["error" => "Document not found"];

        $deleted = $docModel->deleteById($docId);
        if ($deleted) {
            log_case_activity($doc['case_id'], $userId, 'document_deleted', ["doc_id" => $docId, "file_url" => $doc['file_url']]);
            return ["success" => true];
        }

        return ["error" => "Failed to delete document"];
    }
}
