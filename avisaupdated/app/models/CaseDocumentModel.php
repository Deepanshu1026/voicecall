<?php
require_once __DIR__ . '/../helpers/db.php';

class CaseDocumentModel {

    private $db;

    public function __construct()
    {
        $this->db = db();
    }

    public function saveDocument($caseId, $fileName, $fileUrl, $uploadedBy)
    {
        $stmt = $this->db->prepare("
            INSERT INTO case_documents (case_id, file_name, file_url, uploaded_by)
            VALUES (?, ?, ?, ?)
        ");
        $stmt->bind_param("issi", $caseId, $fileName, $fileUrl, $uploadedBy);
        $stmt->execute();
        return $this->db->insert_id;
    }

    public function getDocumentsByCase($caseId)
    {
        $stmt = $this->db->prepare("
            SELECT cd.*, u.name as uploaded_by_name
            FROM case_documents cd
            LEFT JOIN users u ON u.id = cd.uploaded_by
            WHERE cd.case_id = ?
            ORDER BY cd.uploaded_at DESC
        ");
        $stmt->bind_param("i", $caseId);
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    public function getById($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM case_documents WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    public function deleteById($id)
    {
        $stmt = $this->db->prepare("DELETE FROM case_documents WHERE id = ?");
        $stmt->bind_param("i", $id);
        return $stmt->execute();
    }
}
