<?php
/**
 * Voice bridge helper for the Avisa agent portal.
 *
 * Provides functions that talk to the Node voice app's PHP bridge endpoint
 * and return a short-lived JWT the agent can use to open the call dashboard.
 */

require_once __DIR__ . '/voice_bridge_config.php';

if (!function_exists('createVoiceCallToken')) {
    /**
     * Request a JWT from the Node voice app bridge.
     *
     * @param string|int $userId      The user/agent ID used by the portal.
     * @param string     $role        'agent' or 'user'.
     * @param string     $displayName   Human-readable name shown in the call UI.
     * @param string|int|null $agentId Optional agent ID when role is 'user'.
     * @return array{success: bool, token?: string, error?: string, dashboard_url?: string}
     */
    function createVoiceCallToken($userId, $role, $displayName, $agentId = null)
    {
        if (empty($userId)) {
            return [
                'success' => false,
                'error'   => 'Missing userId'
            ];
        }

        if (!in_array($role, ['agent', 'user'], true)) {
            return [
                'success' => false,
                'error'   => 'Invalid role. Must be agent or user.'
            ];
        }

        $payload = [
            'sharedSecret' => PHP_BRIDGE_SECRET,
            'userId'       => (string) $userId,
            'role'         => $role,
            'displayName'  => (string) $displayName,
            'agentId'      => $agentId === null ? null : (string) $agentId
        ];

        $ch = curl_init(VOICE_BRIDGE_ENDPOINT);
        if (!$ch) {
            return [
                'success' => false,
                'error'   => 'Unable to initialize cURL'
            ];
        }

        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode($payload),
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'Accept: application/json'
            ],
            CURLOPT_TIMEOUT        => 15,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($response === false || $curlError) {
            return [
                'success' => false,
                'error'   => 'Bridge request failed: ' . ($curlError ?: 'unknown cURL error')
            ];
        }

        $data = json_decode($response, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return [
                'success' => false,
                'error'   => 'Invalid JSON response from voice bridge (HTTP ' . $httpCode . ')'
            ];
        }

        if (empty($data['success']) || empty($data['token'])) {
            return [
                'success' => false,
                'error'   => $data['error'] ?? 'Voice bridge did not return a token'
            ];
        }

        return [
            'success'     => true,
            'token'       => $data['token'],
            'dashboard_url' => VOICE_APP_URL . '/auth-callback?token=' . urlencode($data['token'])
        ];
    }
}

if (!function_exists('createAgentVoiceCallToken')) {
    /**
     * Convenience wrapper for agents.
     *
     * @param string|int $agentId
     * @param string     $displayName
     * @return array{success: bool, token?: string, error?: string, dashboard_url?: string}
     */
    function createAgentVoiceCallToken($agentId, $displayName)
    {
        return createVoiceCallToken($agentId, 'agent', $displayName);
    }
}
