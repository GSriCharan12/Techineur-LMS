// Let's use http module
const http = require('http');

http.get('http://localhost:5000/api/admin/courses', (res) => {
    console.log('Status code:', res.statusCode);
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log('Response:', data);
        process.exit(0);
    });
}).on('error', (err) => {
    console.log('Error:', err.message);
    process.exit(1);
});
