const db = require('./config/db');

db.query("SELECT id, name, email, password FROM faculty", (err, results) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log("Full Faculty Debug:");
    results.forEach(f => {
        console.log(`ID: ${f.id}, Name: ${f.name}, Email: ${f.email}, HasPassword: ${f.password ? 'Yes' : 'No'}`);
    });
    process.exit(0);
});
