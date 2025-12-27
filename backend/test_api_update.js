const http = require('http');
require('dotenv').config();

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

function post(url, data, token, method = 'POST') {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify(data);
        const headers = {
            'Content-Type': 'application/json',
            'Content-Length': body.length
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const req = http.request(url, {
            method: method,
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

async function testUpdateStudent() {
    try {
        console.log('Logging in...');
        const loginRes = await post('http://localhost:5000/api/auth/login', { email: adminEmail, password: adminPassword });
        const token = loginRes.body.token;

        console.log('Updating student 2...');
        const updateRes = await post('http://localhost:5000/api/admin/students/2', {
            name: 'Charan API Updated',
            email: 'charan@api.com',
            section: 'C'
        }, token, 'PUT');

        console.log('Update Result:', updateRes);
    } catch (err) {
        console.error('Error:', err.message);
    }
    process.exit(0);
}

testUpdateStudent();
