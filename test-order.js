// Test script to check order API
const http = require('http');

const testData = {
  tableNumber: 1,
  items: [
    { id: 1, name: 'Test Item', price: 100, quantity: 2, notes: 'Test notes' }
  ],
  totalPrice: 200,
  notes: 'Test order'
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/orders',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('Testing order API...');
console.log('Data to send:', testData);

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    try {
      const result = JSON.parse(data);
      console.log('Parsed result:', result);
    } catch (e) {
      console.error('Failed to parse response:', e);
    }
  });
});

req.on('error', (e) => {
  console.error(`Request error: ${e.message}`);
});

req.write(postData);
req.end();
