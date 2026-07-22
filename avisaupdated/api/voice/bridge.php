<?php
/**
 * Internal PHP endpoint that returns a voice-call JWT for the logged-in agent.
 *
 * GET /api/voice/bridge
 * Response:
 *   { "success": true, "token": "...", "dashboard_url": "..." }
 * or
 *   { "success": false, "error": "..." }
 */

require_once __DIR__ . '/../../app/helpers/auth.php';
require_once __DIR__ . '/../../include/voice_bridge_helper.php';

require_auth();
require_role('agent');

header('Content-Type: application/json');

$agentId     = $_SESSION['user_id'] ?? null;
$displayName = $_SESSION['user_name'] ?? 'Agent';

if (!$agentId) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error'   => 'Agent session not found'
    ]);
    exit;
}

$result = createAgentVoiceCallToken($agentId, $displayName);

if (!$result['success']) {
    http_response_code(502);
    echo json_encode($result);
    exit;
}

echo json_encode($result);
exit;
