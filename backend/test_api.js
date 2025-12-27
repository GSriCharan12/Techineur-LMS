const assert = require('assert');

const BASE_URL = 'http://localhost:5000/api';
let token = '';

async function testLogin() {
    console.log('Testing Login...');
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'admin@gmail.com',
            password: 'admin123'
        })
    });

    const data = await response.json();
    console.log('Login Response:', data);

    assert.strictEqual(response.status, 200, 'Login failed');
    assert.ok(data.token, 'No token received');
    token = data.token;
    console.log('Login Passed ✅');
}

async function testGetStudents() {
    console.log('Testing Get Students...');
    const response = await fetch(`${BASE_URL}/admin/students`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    console.log(`Got ${data.length} students`);
    assert.strictEqual(response.status, 200, 'Get students failed');
    console.log('Get Students Passed ✅');
}

async function testAddStudent() {
    console.log('Testing Add Student...');
    const response = await fetch(`${BASE_URL}/admin/students`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            name: 'Test Student',
            email: 'test@student.com'
        })
    });

    const data = await response.json();
    console.log('Add Student Response:', data);
    assert.strictEqual(response.status, 200, 'Add student failed');
    console.log('Add Student Passed ✅');
}

async function runTests() {
    try {
        await testLogin();
        await testAddStudent();
        await testGetStudents();
        console.log('ALL TESTS PASSED 🚀');
    } catch (error) {
        console.error('TEST FAILED ❌', error);
        process.exit(1);
    }
}

// Wait for server to start
setTimeout(runTests, 2000);
