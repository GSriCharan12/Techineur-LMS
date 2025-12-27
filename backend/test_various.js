const http = require('http');
require('dotenv').config();

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

function post(url, data) {
    return new Promise((resolve) => {
        const body = JSON.stringify(data);
        const req = http.request(url, { method: 'POST', headers: { 'Content-Type': 'application/json' } }, (res) => {
            let d = ''; res.on('data', (c) => d += c); res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(d) }));
        });
        req.write(body); req.end();
    });
}

async function testVarious() {
    const adminLogin = await post('http://localhost:5000/api/auth/login', { email: adminEmail, password: adminPassword });
    const token = adminLogin.body.token;

    const urls = [
        'http://localhost:5000/api/admin/faculty-list',
        'http://localhost:5000/api/admin/courses',
        'http://localhost:5000/api/admin/students'
    ];

    for (const url of urls) {
        const res = await new Promise((resolve) => {
            http.get(url, { headers: { 'Authorization': `Bearer ${token}` } }, (res) => {
                let d = ''; res.on('data', (c) => d += c); res.on('end', () => resolve({ status: res.statusCode, length: d.length }));
            });
        });
        console.log(`${url}: Status ${res.status}, Length ${res.length}`);
    }
    process.exit(0);
}

testVarious();
