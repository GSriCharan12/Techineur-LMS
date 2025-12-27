const db = require('./config/db');

async function updateTables() {
    const q1 = "ALTER TABLE students ADD COLUMN section VARCHAR(10) DEFAULT NULL";
    const q2 = "ALTER TABLE courses ADD COLUMN section VARCHAR(10) DEFAULT 'A'"; // Defaulting to A for existing

    db.query(q1, (err) => {
        if (err && err.code !== 'ER_DUP_FIELDNAME') console.error(err);
        else console.log("Added section to students");
    });

    db.query(q2, (err) => {
        if (err && err.code !== 'ER_DUP_FIELDNAME') console.error(err);
        else console.log("Added section to courses");
        process.exit();
    });
}

updateTables();
