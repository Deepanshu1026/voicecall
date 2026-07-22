<?php

function valid_case_statuses() {
    return [
        "pending",
        "assigned",
        "in-progress",
        "waiting-doc-approval",
        "approved",
        "waiting-case-approval",
        "completed",
        "reopened",
        "cancelled"
    ];
}

function can_transition($from, $to) {
    $transitions = [
        "pending" => ["assigned"],
        "assigned" => ["in-progress"],
        "in-progress" => ["waiting-doc-approval", "waiting-case-approval"],
        "waiting-doc-approval" => ["approved"],
        "approved" => ["in-progress", "waiting-case-approval"],
        "waiting-case-approval" => ["completed", "in-progress"],
        "completed" => ["reopened"],
        "reopened" => ["in-progress"],
    ];

    return in_array($to, $transitions[$from] ?? []);
}
