<?php

function send_email($to, $subject, $body)
{
    $apiKey = "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";

    $postData = [
        "sender" => [
            "name"  => "Avisa Experts",
            "email" => "avisaexperts.team@gmail.com"
        ],
        "to" => [
            ["email" => $to]
        ],
        "subject" => $subject,
        "htmlContent" => $body
    ];

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => "https://api.brevo.com/v3/smtp/email",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            "accept: application/json",
            "api-key: $apiKey",
            "content-type: application/json"
        ],
        CURLOPT_POSTFIELDS => json_encode($postData)
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [
        "success" => $httpCode === 201,
        "http" => $httpCode,
        "response" => $response
    ];
}
