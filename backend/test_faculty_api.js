const http = require('http');

async function testFacultyDashboard() {
    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'admin123';

    function post(url, data, token) {
        return new Promise((resolve) => {
            const body = JSON.stringify(data);
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const req = http.request(url, { method: 'POST', headers }, (res) => {
                let d = ''; res.on('data', (c) => d += c);
                res.on('end', () => {
                    try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
                    catch (e) { resolve({ status: res.statusCode, body: d }); }
                });
            });
            req.write(body); req.end();
        });
    }

    console.log('Logging in as admin...');
    const adminLogin = await post('http://localhost:5000/api/auth/login', { email: adminEmail, password: adminPassword });
    const adminToken = adminLogin.body.token;

    console.log('Creating test faculty...');
    await post('http://localhost:5000/api/admin/faculty', { name: 'Fac Test', email: 'factest@test.com', password: 'test', department: 'CS', section: 'A' }, adminToken);

    console.log('Logging in as faculty...');
    const facultyLogin = await post('http://localhost:5000/api/auth/login', { email: 'factest@test.com', password: 'test' });
    const facultyToken = facultyLogin.body.token;

    console.log('Fetching faculty dashboard...');
    const dashRes = await new Promise((resolve) => {
        http.get('http://localhost:5000/api/faculty/dashboard', { headers: { 'Authorization': `Bearer ${facultyToken}` } }, (res) => {
            let d = ''; res.on('data', (c) => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d }));
        }).on('error', (e) => resolve({ status: 500, body: e.message }));
    });

    console.log('Result:', dashRes);
    process.exit(0);
}

testFacultyDashboard();
