/**
 * test-api.js
 * Test the backend API connectivity
 */
const http = require('http');

http.get('http://localhost:4000/api/listings', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Success:', json.success);
      console.log('Count:', json.data ? json.data.length : 0);
      if (json.data && json.data.length > 0) {
        console.log('First Title:', json.data[0].title_en);
        console.log('First Images:', json.data[0].images);
      }
    } catch (e) {
      console.log('Parse Error:', e.message);
      console.log('Raw Data:', data.substring(0, 100));
    }
  });
}).on('error', (err) => {
  console.log('Error:', err.message);
});
