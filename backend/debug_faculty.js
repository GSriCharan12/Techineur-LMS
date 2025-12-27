const db = require('./config/db');

db.query("SELECT id, name, email FROM faculty", (err, results) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log("Faculty Accounts:");
    console.table(results);
    process.exit(0);
});
