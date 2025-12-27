const http = require('http');

async function testStudentCourses() {
    // We need a student token. I'll login as 'charan@gmail.com' (I saw it in the list earlier)
    // Actually I don't know the password... assuming 'charan123' or something?
    // Wait, I can just check the login script or database.
    // I'll create a temporary student with a known password.

    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'admin123';

    function post(url, data, token) {
        return new Promise((resolve) => {
            const body = JSON.stringify(data);
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const req = http.request(url, { method: 'POST', headers }, (res) => {
                let d = ''; res.on('data', (c) => d += c); res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(d) }));
            });
            req.write(body); req.end();
        });
    }

    console.log('Logging in as admin...');
    const adminLogin = await post('http://localhost:5000/api/auth/login', { email: adminEmail, password: adminPassword });
    const adminToken = adminLogin.body.token;

    console.log('Creating test student...');
    await post('http://localhost:5000/api/admin/students', { name: 'Test', email: 'test@test.com', password: 'test', section: 'A' }, adminToken);

    console.log('Logging in as student...');
    const studentLogin = await post('http://localhost:5000/api/auth/login', { email: 'test@test.com', password: 'test' });
    const studentToken = studentLogin.body.token;

    console.log('Fetching student courses...');
    const coursesRes = await new Promise((resolve) => {
        http.get('http://localhost:5000/api/student/my-courses', { headers: { 'Authorization': `Bearer ${studentToken}` } }, (res) => {
            let d = ''; res.on('data', (c) => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d }));
        }).on('error', (e) => resolve({ status: 500, body: e.message }));
    });

    console.log('Result:', coursesRes);
    process.exit(0);
}

testStudentCourses();
