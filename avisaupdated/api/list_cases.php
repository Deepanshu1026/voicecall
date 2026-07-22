<?php

require_once __DIR__ . '/../app/helpers/session.php';
require_once __DIR__ . '/../app/controllers/CaseController.php';

$controller = new CaseController();

echo json_encode(
    $controller->getCases()
);
