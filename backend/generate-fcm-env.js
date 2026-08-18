const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'config', 'firebase-service-account.json');

if (!fs.existsSync(filePath)) {
  console.error('Service account file not found at:', filePath);
  process.exit(1);
}

const json = fs.readFileSync(filePath, 'utf8');
const oneLine = JSON.stringify(JSON.parse(json));

console.log('\n=== FCM_SERVICE_ACCOUNT_JSON value ===\n');
console.log(oneLine);
console.log('\n=== Copy the entire line above into your Render env var ===\n');
console.log('Or set this in your .env file (keep it secret):');
console.log(`FCM_SERVICE_ACCOUNT_JSON=${oneLine}\n`);
