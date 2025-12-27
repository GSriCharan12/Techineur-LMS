const db = require('./config/db');

db.query('SELECT * FROM students', (err, results) => {
    if (err) {
        console.log('Error:', err.message);
    } else {
        console.log(JSON.stringify(results, null, 2));
    }
    process.exit(0);
});
