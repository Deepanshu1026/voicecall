const jwt = require('jsonwebtoken');
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhNWYzOGFjNGRhYzMwMzc1Nzk5MGI0ZSIsImlhdCI6MTc4NDc5ODk2OSwiZXhwIjoxNzg1NDAzNzY5fQ.SqPQDRPNPHLJYjh_nNENqcI7RA2CQXXhzdWclIWRJ0Y';
const secret = 'voicecall_jwt_secret_2026_secure_random_key';
try {
  const decoded = jwt.verify(token, secret);
  console.log('Valid with env secret:', JSON.stringify(decoded));
} catch(e) {
  console.log('Invalid with env secret');
}
try {
  const decoded = jwt.verify(token, 'fallback_dev_secret');
  console.log('Valid with fallback:', JSON.stringify(decoded));
} catch(e) {
  console.log('Invalid with fallback');
}
