<?php

// TEST EMAIL — REPLACE WITH YOUR EMAIL
$to = "yourgmail@gmail.com";

$apiKey = "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";

$postData = [
    "sender" => [
        "name" => "Avisa Test",
        "email" => "avisaexperts.team@gmail.com"
    ],
    "to" => [
        ["email" => $to]
    ],
    "subject" => "🚀 Brevo Mail Test from PHP",
    "htmlContent" => "<h3>If you received this email, Brevo SMTP is working!</h3>"
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

// OUTPUT RESULTS
echo "<h2>HTTP Code: $httpCode</h2>";
echo "<pre>";
print_r($response);
echo "</pre>";
?>
