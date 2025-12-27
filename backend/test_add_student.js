const http = require('http');
require('dotenv').config();

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

function post(url, data, token) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify(data);
        const headers = {
            'Content-Type': 'application/json',
            'Content-Length': body.length
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const req = http.request(url, {
            method: 'POST',
            headers: headers
        }, (res) => {
            let resData = '';
            res.on('data', (c) => resData += c);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(resData) });
                } catch (e) {
                    resolve({ status: res.statusCode, body: resData });
                }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

async function testAddStudent() {
    try {
        console.log('Logging in...');
        const loginRes = await post('http://localhost:5000/api/auth/login', { email: adminEmail, password: adminPassword });
        const token = loginRes.body.token;

        console.log('Adding student...');
        const addRes = await post('http://localhost:5000/api/admin/students', {
            name: 'Test Student',
            email: 'test@student.com',
            password: 'password123',
            section: 'A'
        }, token);

        console.log('Add Result:', addRes);
    } catch (err) {
        console.error('Error:', err.message);
    }
    process.exit(0);
}

testAddStudent();
