import jwt from 'jsonwebtoken';

// Generate a test JWT token
const testToken = jwt.sign(
    { id: 'test123', name: 'Test User' },
    'test', // This matches the secret in your auth middleware
    { expiresIn: '1h' }
);

console.log('Generated test JWT token:');
console.log(testToken);
console.log('\n');

// Test API calls
console.log('Test API calls with this token:');
console.log('\n1. Create a conversation:');
console.log(`curl -X POST http://localhost:3000/conversations/conversation \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${testToken}" \\
  -d '{"Subject":"Test Conversation","Attendees":[{"label":"Test User","value":"test123"}]}'`);

console.log('\n2. Get conversations:');
console.log(`curl -X GET http://localhost:3000/conversations \\
  -H "Authorization: Bearer ${testToken}"`);

console.log('\n3. Post a message (replace CONVERSATION_ID with actual ID):');
console.log(`curl -X PATCH http://localhost:3000/conversations/message/CONVERSATION_ID \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${testToken}" \\
  -d '{"sender":"Test User","message":"Hello World","timestamp":"${new Date().toISOString()}","type":"text"}'`);
