<?php
require_once __DIR__ . '/../../app/helpers/session.php';

if (!isset($_SESSION['user_id'])) {
    header("Location: /public/login.php");
    exit;
}
$userName = htmlspecialchars($_SESSION['user_name'] ?? "Guest");
?>
<!DOCTYPE html>
<html>
<head>
    <title>Avisa Experts Portal</title>

    <!-- Bootstrap 5 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">

    <!-- Bootstrap Icons -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">
    <link rel="stylesheet" href="../assets/css/layout.css">
</head>
<body>

<div class="content">
