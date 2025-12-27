const db = require('./config/db');

const tables = ['students', 'faculty', 'courses', 'feedback', 'student_attendance', 'student_grades'];

async function describeTables() {
    for (const table of tables) {
        console.log(`\n--- ${table} ---`);
        await new Promise((resolve) => {
            db.query(`DESCRIBE ${table}`, (err, results) => {
                if (err) {
                    console.log(`Error describing ${table}: ${err.message}`);
                } else {
                    console.log(JSON.stringify(results, null, 2));
                }
                resolve();
            });
        });
    }
    process.exit(0);
}

describeTables();
