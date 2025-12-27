const db = require('./config/db');

const createFaculty = `
CREATE TABLE IF NOT EXISTS faculty (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  department VARCHAR(100)
)`;

const createCourses = `
CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_code VARCHAR(20) NOT NULL UNIQUE,
  course_name VARCHAR(255) NOT NULL,
  faculty_id INT,
  FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE SET NULL
)`;

db.query(createFaculty, (err) => {
    if (err) throw err;
    console.log("Faculty table ready");

    db.query(createCourses, (err) => {
        if (err) throw err;
        console.log("Courses table ready");

        // Seed Data if empty
        db.query("SELECT COUNT(*) as count FROM faculty", (err, res) => {
            if (res[0].count === 0) {
                const sql = `INSERT INTO faculty (name, email, department) VALUES 
          ('Dr. Sharma', 'sharma@test.com', 'CS'),
          ('Dr. Meera', 'meera@test.com', 'CS'),
          ('Mr. Kiran', 'kiran@test.com', 'CS')`;
                db.query(sql, () => console.log("Seeded Faculty"));
            }

            db.query("SELECT COUNT(*) as count FROM courses", (err, res) => {
                if (res[0].count === 0) {
                    const sql = `INSERT INTO courses (course_code, course_name, faculty_id) VALUES 
            ('CS201', 'Objects Oriented Programming', 1),
            ('CS202', 'Theory of Computation', 2),
            ('CS203', 'Design and Analysis of Algorithms', 3)`;
                    db.query(sql, () => {
                        console.log("Seeded Courses");
                        process.exit(0);
                    });
                } else {
                    process.exit(0);
                }
            });
        });
    });
});
