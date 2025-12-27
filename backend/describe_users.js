const db = require('./config/db');

db.query('DESCRIBE users', (err, results) => {
    if (err) {
        console.error('Error describing table:', err);
        process.exit(1);
    }
    console.log('Users table schema:', results);
    process.exit(0);
});
