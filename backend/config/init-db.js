const db = require('./db');

const initDB = async () => {
  return new Promise((resolve, reject) => {
    // 1. Students
    const studentsTable = `
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        section VARCHAR(10)
      )`;

    // 2. Faculty
    const facultyTable = `
      CREATE TABLE IF NOT EXISTS faculty (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        department VARCHAR(100),
        section VARCHAR(10)
      )`;

    // 3. Courses
    const coursesTable = `
      CREATE TABLE IF NOT EXISTS courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_code VARCHAR(20) NOT NULL UNIQUE,
        course_name VARCHAR(255) NOT NULL,
        faculty_id INT,
        section VARCHAR(10),
        FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE SET NULL
      )`;

    // 4. Feedback
    const feedbackTable = `
      CREATE TABLE IF NOT EXISTS feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        faculty_id INT NOT NULL,
        rating INT NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE
      )`;

    // 5. Attendance
    const attendanceTable = `
      CREATE TABLE IF NOT EXISTS student_attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        course_name VARCHAR(100) NOT NULL,
        status ENUM('Present', 'Absent') NOT NULL,
        date DATE NOT NULL,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      )`;

    // 6. Grades
    const gradesTable = `
      CREATE TABLE IF NOT EXISTS student_grades (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        course_name VARCHAR(100) NOT NULL,
        grade VARCHAR(5) NOT NULL,
        semester VARCHAR(20) NOT NULL,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      )`;

    // 7. Materials (Persist Uploads)
    const materialsTable = `
      CREATE TABLE IF NOT EXISTS materials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        file_path VARCHAR(255) NOT NULL,
        file_content LONGTEXT, 
        faculty_id INT,
        section VARCHAR(10),
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE SET NULL
      )`;

    const tables = [studentsTable, facultyTable, coursesTable, feedbackTable, attendanceTable, gradesTable, materialsTable];

    let count = 0;
    const runQuery = (index) => {
      if (index >= tables.length) {
        console.log("✅ All tables verified/created");
        return resolve();
      }

      db.query(tables[index], (err) => {
        if (err) {
          console.error(`DB INIT ERROR on table ${index}:`, err.message);
          // Some tables might depend on others, but CREATE TABLE IF NOT EXISTS with FKs should be fine if ordered correctly
        }
        runQuery(index + 1);
      });
    };

    runQuery(0);

    // Schema Migration for existing table
    setTimeout(() => {
      const migrationQuery = "ALTER TABLE materials ADD COLUMN file_content LONGTEXT";
      db.query(migrationQuery, (err) => {
        if (!err) console.log("✅ Schema migration: Added file_content to materials");
        // ignore error if column exists
      });
    }, 2000); // Run after table creation loop
  });
};

module.exports = initDB;
