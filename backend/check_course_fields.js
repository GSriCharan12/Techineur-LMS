const db = require('./config/db');

db.query('DESCRIBE courses', (err, results) => {
    if (err) {
        console.log('Error:', err.message);
    } else {
        const fields = results.map(r => r.Field).join(', ');
        console.log('FIELDS:', fields);
    }
    process.exit(0);
});
