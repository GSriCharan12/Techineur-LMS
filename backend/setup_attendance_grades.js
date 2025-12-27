const db = require('./config/db');

async function setupAttendanceAndGrades() {
    const attendanceTable = `
    CREATE TABLE IF NOT EXISTS student_attendance (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      course_name VARCHAR(100) NOT NULL,
      status ENUM('Present', 'Absent') NOT NULL,
      date DATE NOT NULL,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );
  `;

    const gradesTable = `
    CREATE TABLE IF NOT EXISTS student_grades (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      course_name VARCHAR(100) NOT NULL,
      grade VARCHAR(5) NOT NULL,
      semester VARCHAR(20) NOT NULL,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );
  `;

    db.query(attendanceTable, (err) => {
        if (err) console.error("Error creating attendance table:", err);
        else console.log("Attendance table ready.");
    });

    db.query(gradesTable, (err) => {
        if (err) console.error("Error creating grades table:", err);
        else console.log("Grades table ready.");

        // Seed data for testing (id 1 assumed as a student id)
        // In a real app, these would be added by faculty/admin
        const checkStudent = "SELECT id FROM students LIMIT 1";
        db.query(checkStudent, (err, results) => {
            if (results.length > 0) {
                const sid = results[0].id;
                const seedAttendance = `INSERT INTO student_attendance (student_id, course_name, status, date) VALUES 
                (?, 'Advanced JS', 'Present', CURDATE()),
                (?, 'MySQL Mastery', 'Absent', CURDATE());`;
                const seedGrades = `INSERT INTO student_grades (student_id, course_name, grade, semester) VALUES 
                (?, 'Data Structures', 'A', 'Fall 2024'),
                (?, 'Algorithms', 'B+', 'Spring 2024');`;

                db.query(seedAttendance, [sid, sid], () => console.log("Seeded attendance"));
                db.query(seedGrades, [sid, sid], () => {
                    console.log("Seeded grades");
                    process.exit();
                });
            } else {
                process.exit();
            }
        });
    });
}

setupAttendanceAndGrades();
