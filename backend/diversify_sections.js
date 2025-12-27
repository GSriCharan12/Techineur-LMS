const db = require('./config/db');

// Distribute existing courses across sections for testing
const updates = [
    { code: 'CS202', section: 'B' },
    { code: 'CS203', section: 'C' },
    { code: 'CS204', section: 'D' },
    { code: 'CS205', section: 'B' },
    { code: 'CS206', section: 'C' }
];

async function diversify() {
    for (const item of updates) {
        await new Promise(resolve => {
            db.query("UPDATE courses SET section = ? WHERE course_code = ?", [item.section, item.code], resolve);
        });
    }
    console.log("Diversified course sections for testing.");
    process.exit();
}

diversify();
