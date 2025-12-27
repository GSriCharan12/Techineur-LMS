const db = require('./config/db');

const query = `
    SELECT courses.id, courses.course_code, courses.course_name, courses.section, faculty.name as faculty_name, courses.faculty_id 
    FROM courses 
    LEFT JOIN faculty ON courses.faculty_id = faculty.id
`;

db.query(query, (err, results) => {
    if (err) {
        console.error('QUERY FAILED:', err);
    } else {
        console.log('QUERY SUCCESS:', results.length, 'rows');
    }
    process.exit(0);
});
