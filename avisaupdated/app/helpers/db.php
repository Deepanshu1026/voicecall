<?php

function db()
{
    $config = include __DIR__ . '/../../config/database.php';
    return new mysqli(
        $config['host'],
        $config['user'],
        $config['pass'],
        $config['name']
    );
}
