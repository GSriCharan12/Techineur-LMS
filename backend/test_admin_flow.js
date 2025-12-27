const http = require('http');
require('dotenv').config();

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

function post(url, data) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify(data);
        const req = http.request(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': body.length
            }
        }, (res) => {
            let resData = '';
            res.on('data', (c) => resData += c);
            res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(resData) }));
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

function get(url, token) {
    return new Promise((resolve, reject) => {
        const req = http.request(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }, (res) => {
            let resData = '';
            res.on('data', (c) => resData += c);
            res.on('end', () => resolve({ status: res.statusCode, body: resData }));
        });
        req.on('error', reject);
        req.end();
    });
}

async function testStats() {
    try {
        console.log('Logging in as admin...');
        const loginRes = await post('http://localhost:5000/api/auth/login', { email: adminEmail, password: adminPassword });
        console.log('Login Status:', loginRes.status);
        if (loginRes.status !== 200) {
            console.log('Login Failed:', loginRes.body);
            return;
        }

        const token = loginRes.body.token;
        console.log('Fetching stats...');
        const statsRes = await get('http://localhost:5000/api/admin/stats', token);
        console.log('Stats Status:', statsRes.status);
        console.log('Stats Body:', statsRes.body);
    } catch (err) {
        console.error('Error:', err.message);
    }
    process.exit(0);
}

testStats();
