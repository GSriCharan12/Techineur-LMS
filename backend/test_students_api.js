const http = require('http');
require('dotenv').config();

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

async function testFetchStudents() {
    // Login
    const loginBody = JSON.stringify({ email: adminEmail, password: adminPassword });
    const loginRes = await new Promise((resolve) => {
        const req = http.request('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': loginBody.length }
        }, (res) => {
            let d = '';
            res.on('data', (c) => d += c);
            res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(d) }));
        });
        req.write(loginBody);
        req.end();
    });

    const token = loginRes.body.token;

    // Fetch students
    const studentRes = await new Promise((resolve) => {
        const req = http.request('http://localhost:5000/api/admin/students', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        }, (res) => {
            let d = '';
            res.on('data', (c) => d += c);
            res.on('end', () => resolve({ status: res.statusCode, body: d }));
        });
        req.end();
    });

    console.log('Status:', studentRes.status);
    console.log('Body:', studentRes.body);
    process.exit(0);
}

testFetchStudents();
