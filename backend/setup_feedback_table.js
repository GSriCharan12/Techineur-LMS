const db = require('./config/db');

async function setupFeedbackTable() {
    const feedbackTable = `
    CREATE TABLE IF NOT EXISTS feedback (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      faculty_id INT NOT NULL,
      rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE
    );
  `;

    db.query(feedbackTable, (err) => {
        if (err) console.error("Error creating feedback table:", err);
        else {
            console.log("Feedback table ready.");
            // Optional: Seed some initial feedback
            const checkData = "SELECT id FROM feedback LIMIT 1";
            db.query(checkData, (err, rows) => {
                if (rows && rows.length === 0) {
                    // Seed logic here if needed
                    console.log("Seeding initial feedback...");
                }
                process.exit();
            });
        }
    });
}

setupFeedbackTable();
