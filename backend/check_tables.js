const db = require('./config/db');

const query = `
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = '${process.env.DB_NAME || 'lms_db'}';
`;

db.query(query, (err, results) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log("Tables:", results.map(r => r.TABLE_NAME));
    process.exit(0);
});
