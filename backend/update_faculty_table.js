const db = require('./config/db');
const bcrypt = require('bcryptjs');

const alterTable = `
ALTER TABLE faculty
ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT '';
`;

db.query(alterTable, async (err) => {
    if (err && err.code !== 'ER_DUP_FIELDNAME') {
        console.error("Error altering table:", err);
    } else {
        console.log("Password column added or already exists.");
    }

    // Update existing faculty with default password 'faculty123'
    const hashedPassword = await bcrypt.hash("faculty123", 10);
    const updateQuery = "UPDATE faculty SET password = ? WHERE password = '' OR password IS NULL";

    db.query(updateQuery, [hashedPassword], (err, result) => {
        if (err) console.error("Error updating passwords:", err);
        else console.log("Updated faculty default passwords.");
        process.exit(0);
    });
});
