<?php
/**
 * Voice bridge configuration for the Avisa agent portal.
 * This file is shared between the agent portal and (eventually) the user site.
 */

if (!defined('PHP_BRIDGE_SECRET')) {
    define('PHP_BRIDGE_SECRET', '58b92c807e2b14ff703bd812157ff9d5039034577167a44a3ab459013a443762');
}

if (!defined('VOICE_APP_URL')) {
    // Local development URL. Change this to your deployed Node app URL in production.
    define('VOICE_APP_URL', 'http://localhost:3000');
}

if (!defined('VOICE_BRIDGE_ENDPOINT')) {
    define('VOICE_BRIDGE_ENDPOINT', VOICE_APP_URL . '/api/auth/php-bridge');
}
