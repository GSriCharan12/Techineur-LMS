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

        const coursesQuery = "SELECT COUNT(*) as count FROM courses WHERE faculty_id = ?";
        db.query(coursesQuery, [facultyId], (err, results) => {
            if (err) return res.status(500).json({ message: "Error fetching courses" });
            stats.activeCourses = results[0].count;
            stats.totalStudents = results[0].count * 25;
            stats.assignments = results[0].count * 3;
            stats.avgGrade = "85%";

            res.json({
                facultyInfo,
                stats,
                recentActivity: [
                    { id: 1, action: "Graded Assignment 3", time: "Just now", type: "check" },
                    { id: 2, action: "Posted new lecture materials", time: "2 hours ago", type: "upload" }
                ]
            });
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
