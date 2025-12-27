const db = require('./config/db');

db.query('DESCRIBE faculty', (err, results) => {
    if (err) {
        console.log('Error describing faculty:', err.message);
    } else {
        results.forEach(col => {
            console.log(`FIELD: ${col.Field} | TYPE: ${col.Type}`);
        });
    }
    process.exit(0);
});
