<?php
// api/appointments_list.php

// session is already started in index.php
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'Unauthorized access']);
    exit;
}

$dbConfig = require __DIR__ . '/../config/database2.php';
$conn = new mysqli($dbConfig['host'], $dbConfig['user'], $dbConfig['pass'], $dbConfig['name']);

if ($conn->connect_error) {
    echo json_encode(['error' => 'Connection failed: ' . $conn->connect_error]);
    exit;
}

// Filtering logic
$startDate = $_GET['start_date'] ?? null;
$endDate = $_GET['end_date'] ?? null;
$plan = $_GET['plan'] ?? null;
$singleDate = $_GET['single_date'] ?? null;

$whereClauses = [];
if ($startDate && $endDate) {
    $whereClauses[] = "date BETWEEN '" . $conn->real_escape_string($startDate) . "' AND '" . $conn->real_escape_string($endDate) . "'";
} elseif ($startDate) {
    $whereClauses[] = "date >= '" . $conn->real_escape_string($startDate) . "'";
} elseif ($endDate) {
    $whereClauses[] = "date <= '" . $conn->real_escape_string($endDate) . "'";
}

if ($singleDate) {
    $whereClauses[] = "date = '" . $conn->real_escape_string($singleDate) . "'";
}

if ($plan && $plan !== 'all') {
    if ($plan === 'Basic') {
        $whereClauses[] = "selected_plan = 'Basic'";
    } elseif ($plan === 'Paid') {
        $whereClauses[] = "selected_plan IN ('Advance', 'Premium')";
    } else {
        $whereClauses[] = "selected_plan = '" . $conn->real_escape_string($plan) . "'";
    }
}

$whereClause = "";
if (!empty($whereClauses)) {
    $whereClause = " WHERE " . implode(" AND ", $whereClauses);
}

// Modify the query to fetch specific details including admin_remark
$query = "SELECT id, name, email, address, contact, querry, mode, date, selected_plan, time_slot, submission_time, datetime, end_time, reference_id, meeting_confirm, updated_status, admin_remark FROM appointments" . $whereClause . " ORDER BY date DESC, id DESC";
$result = $conn->query($query);

if ($result) {
    $AllSubmittedData = $result->fetch_all(MYSQLI_ASSOC);
    $count = count($AllSubmittedData);

    // Get the total count of all appointments with filter
    $totalQuery = "SELECT COUNT(*) AS total_count FROM appointments" . $whereClause;
    $totalResult = $conn->query($totalQuery);
    $totalCount = $totalResult->fetch_assoc()['total_count'];

    echo json_encode([
        'success' => true,
        'count' => $count, 
        'total_count' => (int)$totalCount, 
        'data' => $AllSubmittedData
    ]);
} else {
    echo json_encode(['success' => false, 'error' => $conn->error]);
}

$conn->close();
