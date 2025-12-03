// Test script for /api/trends endpoint
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/trends',
  method: 'GET'
};

console.log('Testing /api/trends endpoint...');
console.log('Request:', `http://${options.hostname}:${options.port}${options.path}`);

const req = http.request(options, (res) => {
  console.log(`\nStatus Code: ${res.statusCode}`);
  console.log('Headers:', res.headers);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\nResponse Body:');
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));
      console.log(`\n✅ Successfully received ${json.length} trends`);
    } catch (e) {
      console.log(data);
      console.log('\n❌ Failed to parse JSON');
    }
  });
});

req.on('error', (error) => {
  console.error('\n❌ Request error:', error.message);
  console.error('Make sure the dev server is running: npm run dev');
});

req.end();









