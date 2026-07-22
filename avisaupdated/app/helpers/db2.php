<?php

function db2()
{
    $config = include __DIR__ . '/../../config/database2.php';
    $conn = new mysqli(
        $config['host'],
        $config['user'],
        $config['pass'],
        $config['name']
    );

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    return $conn;
}
