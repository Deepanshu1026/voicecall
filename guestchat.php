<?php
// Proxy the guest chat widget from the avisaexperts17july site directory
// so it works when the domain points to the repo root.
chdir(__DIR__ . '/avisaexperts17july');
include 'guestchat.php';
