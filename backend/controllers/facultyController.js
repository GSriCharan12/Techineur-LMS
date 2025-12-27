const db = require("../config/db");

exports.getDashboardData = (req, res) => {
    const facultyId = req.user.id;

    // Fetch faculty info
    db.query("SELECT name, department, section FROM faculty WHERE id = ?", [facultyId], (err, facultyResults) => {
        if (err || facultyResults.length === 0) return res.status(500).json({ message: "Error" });

        const facultyInfo = facultyResults[0];

        const stats = {
            activeCourses: 0,
            totalStudents: 0,
            assignments: 0,
            avgGrade: "0%"
        };

        // 1. Get Active Courses Count
        const coursesQuery = "SELECT COUNT(*) as count, GROUP_CONCAT(DISTINCT section) as sections FROM courses WHERE faculty_id = ?";

        db.query(coursesQuery, [facultyId], (err, courseResults) => {
            if (err) return res.status(500).json({ message: "Error fetching courses" });

            stats.activeCourses = courseResults[0].count;
            const sections = courseResults[0].sections ? courseResults[0].sections.split(',') : [];

            // 2. Get Actual Student Count for those sections
            if (sections.length > 0) {
                // Prepare 'IN' clause safely
                const placeholders = sections.map(() => '?').join(',');
                const studentsQuery = `SELECT COUNT(*) as count FROM students WHERE section IN (${placeholders})`;

                db.query(studentsQuery, sections, (err, studentResults) => {
                    if (!err && studentResults.length > 0) {
                        stats.totalStudents = studentResults[0].count;
                    }
                    sendResponse();
                });
            } else {
                sendResponse();
            }

            function sendResponse() {
                stats.assignments = 0; // Still 0 for now as no assignment table

                // 3. Calculate Average Grade
                // Logic: Fetch all grades for students in the faculty's sections (simplified)
                // Better Logic: Fetch grades for COURSES taught by this faculty.

                // Get course names taught by this faculty
                db.query("SELECT course_name FROM courses WHERE faculty_id = ?", [facultyId], (err, courseRes) => {
                    if (err || courseRes.length === 0) {
                        stats.avgGrade = "N/A";
                        return finalize();
                    }

                    const courseNames = courseRes.map(c => c.course_name);
                    if (courseNames.length === 0) { finalize(); return; }

                    const placeholders = courseNames.map(() => '?').join(',');
                    db.query(`SELECT grade FROM student_grades WHERE course_name IN (${placeholders})`, courseNames, (err, gradeRes) => {
                        if (!err && gradeRes.length > 0) {
                            let total = 0;
                            let count = 0;
                            const gradeMap = {
                                'A': 95, 'A-': 90, 'B+': 87, 'B': 83, 'B-': 80,
                                'C+': 77, 'C': 73, 'C-': 70, 'D': 65, 'F': 0
                            };

                            gradeRes.forEach(g => {
                                const val = gradeMap[g.grade] || 75; // Default C average if unknown
                                total += val;
                                count++;
                            });

                            stats.avgGrade = Math.round(total / count) + "%";
                        } else {
                            stats.avgGrade = "No Data";
                        }
                        finalize();
                    });
                });

                function finalize() {
                    res.json({
                        facultyInfo,
                        stats,
                        recentActivity: [
                            { id: 1, action: "System Ready", time: "Just now", type: "info" }
                        ]
                    });
                }
            }
        });
    });
};

// ... existing code ...
exports.postActivity = (req, res) => {
    // ... (existing postActivity logic) ...
    const { action, type } = req.body;
    const io = req.app.get("io");

    const activity = {
        id: Date.now(),
        action,
        time: "Just now",
        type: type || "info"
    };

    io.emit("new-activity", activity);
    res.json({ message: "Activity posted", activity });
};

exports.uploadMaterial = (req, res) => {
    const { title, filename, section } = req.body; // Expecting manually provided section or use faculty's
    const facultyId = req.user.id;

    // First get faculty section if not provided (assume uploaded for their own section)
    db.query("SELECT section FROM faculty WHERE id = ?", [facultyId], (err, results) => {
        if (err || results.length === 0) return res.status(500).json({ message: "Error finding faculty info" });

        const targetSection = section || results[0].section || 'A';
        const filePath = `/uploads/${filename}`; // Simulation path

        db.query(
            "INSERT INTO materials (title, file_path, faculty_id, section) VALUES (?, ?, ?, ?)",
            [title, filePath, facultyId, targetSection],
            (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: "DB Error" });
                }

                // Broadcast
                const io = req.app.get("io");
                const activityObj = {
                    id: Date.now(),
                    action: `New Material: ${title} (files: ${filename})`,
                    time: "Just now",
                    type: "upload"
                };
                if (io) io.emit("new-activity", activityObj);

                res.json({ message: "Material uploaded", id: result.insertId });
            }
        );
    });
};
