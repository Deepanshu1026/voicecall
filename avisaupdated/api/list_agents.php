<?php
require_once __DIR__ . '/../app/helpers/session.php';
require_once __DIR__ . '/../app/helpers/auth.php';
require_once __DIR__ . '/../app/helpers/db.php';

require_auth();

$db = db();
$result = $db->query("SELECT id, user_name FROM calling_team ORDER BY user_name ASC");

$agents = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $agents[] = $row;
    }
}

echo json_encode([
    "success" => true,
    "agents" => $agents
]);
