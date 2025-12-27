const db = require('./config/db');

db.query('DESCRIBE courses', (err, results) => {
    if (err) {
        console.log('Error describing courses:', err.message);
    } else {
        console.log(results);
    }
    process.exit(0);
});
