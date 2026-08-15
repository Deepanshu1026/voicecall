<?php
// Proxy the guest creation endpoint from the avisaexperts17july site directory
// so it works when the domain points to the repo root.
chdir(__DIR__ . '/avisaexperts17july');
include 'insert_webguest.php';
