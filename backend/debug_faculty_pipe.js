const db = require('./config/db');

db.query("SELECT id, name, email, password FROM faculty", (err, results) => {
    if (err) {
        process.exit(1);
    }
    const data = results.map(f => `${f.id}|${f.name}|${f.email}|${f.password ? 'YES' : 'NO'}`).join('\n');
    console.log(data);
    process.exit(0);
});
