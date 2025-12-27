const db = require("../config/db");

exports.setSection = (req, res) => {
    const { section } = req.body;
    const studentId = req.user.id;

    if (!section) return res.status(400).json({ message: "Section required" });

    db.query("UPDATE students SET section = ? WHERE id = ?", [section, studentId], (err) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ message: "Section updated successfully" });
    });
};

exports.getMyCourses = (req, res) => {
    const studentId = req.user.id;

    // First get student's section
    db.query("SELECT section FROM students WHERE id = ?", [studentId], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });

        if (results.length === 0) return res.status(404).json({ message: "Student not found" });

        const section = results[0].section;
        if (!section) return res.json([]); // No section, no courses

        // Get courses for this section
        const courseQuery = `
      SELECT c.course_code, c.course_name, f.name as faculty_name 
      FROM courses c 
      LEFT JOIN faculty f ON c.faculty_id = f.id 
      WHERE c.section = ?
    `;
        db.query(courseQuery, [section], (err, courses) => {
            if (err) return res.status(500).json({ message: "Database error" });
            res.json(courses);
        });
    });
};

exports.getStudentProfile = (req, res) => {
    const studentId = req.user.id;
    db.query("SELECT id, name, email, section FROM students WHERE id = ?", [studentId], (err, results) => {
        if (err) return res.status(500).json({ message: "DB Error" });
        res.json(results[0]);
    });
};
exports.getAttendance = (req, res) => {
    const studentId = req.user.id;
    db.query("SELECT * FROM student_attendance WHERE student_id = ?", [studentId], (err, results) => {
        if (err) return res.status(500).json({ message: "DB Error" });
        res.json(results);
    });
};

exports.getGrades = (req, res) => {
    const studentId = req.user.id;
    db.query("SELECT * FROM student_grades WHERE student_id = ?", [studentId], (err, results) => {
        if (err) return res.status(500).json({ message: "DB Error" });
        res.json(results);
    });
};

exports.submitFeedback = (req, res) => {
    const { faculty_id, rating, comment } = req.body;
    const student_id = req.user.id;

    if (!faculty_id || !rating) {
        return res.status(400).json({ message: "Faculty and rating are required" });
    }

    const query = "INSERT INTO feedback (student_id, faculty_id, rating, comment) VALUES (?, ?, ?, ?)";
    db.query(query, [student_id, faculty_id, rating, comment], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database error" });
        }

        // Real-time notification
        const io = req.app.get("io");
        if (io) {
            io.emit("new-activity", {
                id: Date.now(),
                action: `New feedback received: ${rating} stars`,
                time: "Just now",
                type: "comment"
            });
        }

        res.status(201).json({ message: "Feedback submitted successfully" });
    });
};

exports.getFaculties = (req, res) => {
    const studentId = req.user.id;

    db.query("SELECT section FROM students WHERE id = ?", [studentId], (err, results) => {
        if (err || results.length === 0) return res.status(500).json({ message: "Database error" });

        const section = results[0].section;

        // Show ALL faculty so students can give feedback to anyone
        const query = "SELECT id, name FROM faculty";
        db.query(query, (err, faculties) => {
            if (err) return res.status(500).json({ message: "Database error" });
            res.json(faculties);
        });
    });
};
// ... existing code ...
exports.getMaterials = (req, res) => {
    const studentId = req.user.id;

    // Get student section first
    db.query("SELECT section FROM students WHERE id = ?", [studentId], (err, results) => {
        if (err || results.length === 0) return res.status(500).json({ message: "DB Error" });
        const section = results[0].section;

        if (!section) return res.json([]); // No section, no materials

        // Get materials for this section OR general materials
        const query = "SELECT * FROM materials WHERE section = ? OR section = 'All' OR section = 'Open' ORDER BY uploaded_at DESC";
        db.query(query, [section], (err, materials) => {
            if (err) return res.status(500).json({ message: "DB Error" });
            res.json(materials);
        });
    });
};
