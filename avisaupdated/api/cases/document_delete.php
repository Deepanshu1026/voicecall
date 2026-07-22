<?php
require_once __DIR__ . '/../../app/helpers/session.php';
require_once __DIR__ . '/../../app/helpers/auth.php';
require_once __DIR__ . '/../../app/helpers/db.php';
require_once __DIR__ . '/../../app/helpers/activity_log.php';

require_auth();

if (!isset($_POST['doc_id'])) {
    echo json_encode(["error" => "doc_id required"]);
    exit;
}

$docId = intval($_POST['doc_id']);

try {
    $db = db();
    
    // First, get the document info and case_id before deleting
    $stmt = $db->prepare("SELECT case_id, file_name, file_url FROM case_documents WHERE id = ?");
    $stmt->bind_param("i", $docId);
    $stmt->execute();
    $result = $stmt->get_result();
    $doc = $result->fetch_assoc();
    
    if (!$doc) {
        echo json_encode(["error" => "Document not found"]);
        exit;
    }
    
    $case_id = $doc['case_id'];
    $file_name = $doc['file_name'];
    
    // Now delete the document
    $deleteStmt = $db->prepare("DELETE FROM case_documents WHERE id = ?");
    $deleteStmt->bind_param("i", $docId);
    $deleteStmt->execute();
    
    // Log the activity
    log_case_activity($case_id, $_SESSION['user_id'], "document_deleted", [
        "doc_id" => $docId,
        "file_name" => $file_name
    ]);
    
    echo json_encode([
        "success" => true,
        "message" => "Document deleted successfully"
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "error" => "Failed to delete document",
        "message" => $e->getMessage()
    ]);
}
