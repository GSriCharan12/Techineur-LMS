const db = require('./config/db');

const createTableQuery = `
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
)`;

db.query(createTableQuery, (err, result) => {
    if (err) {
        console.error('Error creating table:', err);
        process.exit(1);
    }
    console.log('Students table created or already exists');
    process.exit(0);
});
