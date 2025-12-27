const db = require('./config/db');

const query = "UPDATE students SET name = ?, email = ?, section = ? WHERE id = ?";
const params = ['charan updated', 'charan@gmail.com', 'B', 2];

db.query(query, params, (err, result) => {
    if (err) {
        console.error('UPDATE FAILED:', err);
    } else {
        console.log('UPDATE SUCCESS:', result.affectedRows, 'rows');
    }
    process.exit(0);
});
