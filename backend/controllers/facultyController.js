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
                // Assignments are 0 because we don't have an assignments table yet
                stats.assignments = 0;

                res.json({
                    facultyInfo,
                    stats,
                    recentActivity: [
                        { id: 1, action: "System Ready", time: "Just now", type: "info" }
                    ]
                });
            }
        });
    });
};

exports.postActivity = (req, res) => {
    const { action, type } = req.body;
    const io = req.app.get("io");

    const activity = {
        id: Date.now(),
        action,
        time: "Just now",
        type: type || "info"
    };

    // Broadcast to all connected clients
    console.log("Broadcasting activity:", activity);
    io.emit("new-activity", activity);

    res.json({ message: "Activity posted and broadcasted", activity });
};
