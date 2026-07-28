
$body = "{`"messages`":[{`"role`":`"system`",`"content`":`"You are a bot`"},{`"role`":`"user`",`"content`":`"Hi`"},{`"role`":`"user`",`"content`":`"How are you`"}],`"model`":`"sarvam-m`"}"
$response = Invoke-RestMethod -Uri "https://api.sarvam.ai/v1/chat/completions" -Method Post -Headers @{"api-subscription-key"="sk_3anz47av_TgCHGnb221FouOUiZoF9VBY1";"Content-Type"="application/json"} -Body $body
$response.choices[0].message | ConvertTo-Json

