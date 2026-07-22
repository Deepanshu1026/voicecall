<?php
// This is a new standalone API file for application details
require_once __DIR__ . '/../../app/helpers/session.php';
require_once __DIR__ . '/../../app/helpers/db.php';
require_once __DIR__ . '/../../app/controllers/AgentController.php';

header("Content-Type: application/json");

$id = $_GET['id'] ?? 0;

if ($id) {
    // Return specific application details
    $ctrl = new AgentController();
    echo json_encode($ctrl->getApplicationDetails($id));
} else {
    // Return ALL applications (with optional date filtering)
    $startDate = $_GET['start_date'] ?? '';
    $endDate = $_GET['end_date'] ?? '';
    $leadOutcome = $_GET['lead_outcome'] ?? '';
    
    $db = db();
    $startDate = $db->real_escape_string($startDate);
    $endDate = $db->real_escape_string($endDate);
    $leadOutcome = $db->real_escape_string($leadOutcome);

    $sql = "
        SELECT a.*,
               COALESCE(u.name, ct.user_name, 'Unknown') as agent_name
        FROM applications a
        LEFT JOIN users u ON a.agent_id = u.id
        LEFT JOIN calling_team ct ON a.agent_id = ct.id
        WHERE 1=1
    ";

    if ($startDate) {
        $sql .= " AND DATE(a.created_at) >= '$startDate'";
    }
    if ($endDate) {
        $sql .= " AND DATE(a.created_at) <= '$endDate'";
    }
    if ($leadOutcome) {
        // Since lead_outcome is stored inside the JSON 'details' column
        $sql .= " AND (JSON_UNQUOTE(JSON_EXTRACT(a.details, '$.lead_outcome')) = '$leadOutcome' OR a.details LIKE '%\"lead_outcome\":\"$leadOutcome\"%')";
    }

    $sql .= " ORDER BY a.created_at DESC";
    
    $result = $db->query($sql);
    $apps = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $apps[] = $row;
        }
    }
    echo json_encode(['success' => true, 'applications' => $apps]);
}

