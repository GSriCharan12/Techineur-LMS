const db = require("../config/db");

/* ================= DASHBOARD STATS ================= */
exports.getDashboardStats = (req, res) => {
  const stats = {};

  const q1 = new Promise((resolve, reject) => {
    db.query("SELECT COUNT(*) as count FROM students", (err, data) => {
      if (err) reject(err);
      else resolve(data[0].count);
    });
  });

  const q2 = new Promise((resolve, reject) => {
    db.query("SELECT COUNT(*) as count FROM faculty", (err, data) => {
      if (err) reject(err);
      else resolve(data[0].count);
    });
  });

  const q3 = new Promise((resolve, reject) => {
    db.query("SELECT COUNT(*) as count FROM courses", (err, data) => {
      if (err) reject(err);
      else resolve(data[0].count);
    });
  });

  const q4 = new Promise((resolve, reject) => {
    db.query("SELECT COUNT(*) as count, AVG(rating) as avgRating FROM feedback", (err, data) => {
      if (err) reject(err);
      else resolve(data[0]);
    });
  });

  Promise.all([q1, q2, q3, q4])
    .then(([students, faculty, courses, feedback]) => {
      res.json({ students, faculty, courses, feedback });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Error fetching stats" });
    });
};

/* ================= GET COURSES (For Students/Admin) ================= */
exports.getAllCourses = (req, res) => {
  const query = `
    SELECT courses.id, courses.course_code, courses.course_name, courses.section, faculty.name as faculty_name, courses.faculty_id 
    FROM courses 
    LEFT JOIN faculty ON courses.faculty_id = faculty.id
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
    res.json(results);
  });
};

/* ================= MANAGE COURSES ================= */
exports.addCourse = (req, res) => {
  const { code, title, faculty_id, section } = req.body;

  const query = "INSERT INTO courses (course_code, course_name, faculty_id, section) VALUES (?, ?, ?, ?)";
  db.query(query, [code, title, faculty_id || null, section || 'A'], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }

    const io = req.app.get("io");
    if (io) io.emit("course-changed", { action: "added" });

    res.json({ message: "Course added" });
  });
};

exports.deleteCourse = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM courses WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ message: "Database error" });

    const io = req.app.get("io");
    if (io) io.emit("course-changed", { action: "deleted", id });

    res.json({ message: "Course deleted" });
  });
};

exports.getFacultyList = (req, res) => {
  db.query("SELECT * FROM faculty", (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results);
  });
};

/* ================= MANAGE FACULTY ================= */
const bcrypt = require("bcryptjs"); // Ensure bcrypt is imported top-level if not already, or here.
// NOTE: bcrypt is NOT imported at top level in this file currently, only inside authController.
// I will require it inside the function to be safe or add it to file top. 
// Actually I will assume it's safe to require it here if I am lazy, but good practice is top.
// For now, I'll require it inside addFaculty to avoid 'require' overlap issues if valid.

exports.addFaculty = async (req, res) => {
  const { name, email, department, password, section } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "All fields required" });

  try {
    const hashedPassword = await require("bcryptjs").hash(password, 10);
    const query = "INSERT INTO faculty (name, email, department, password, section) VALUES (?, ?, ?, ?, ?)";

    db.query(query, [name, email, department, hashedPassword, section || null], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }

      // Real-time update
      const io = req.app.get("io");
      if (io) io.emit("faculty-changed", { action: "added" });

      res.status(201).json({ message: "Faculty added" });
    });
  } catch (e) {
    res.status(500).json({ message: "Error" });
  }
};

exports.deleteFaculty = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM faculty WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("Delete Faculty Error:", err);
      // Check for Foreign Key Constraint
      if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
        return res.status(400).json({ message: "Cannot delete faculty assigned to a course/section." });
      }
      return res.status(500).json({ message: "DB Error: " + err.sqlMessage });
    }

    // Real-time update
    const io = req.app.get("io");
    if (io) io.emit("faculty-changed", { action: "deleted", id });

    res.json({ message: "Faculty deleted" });
  });
};

exports.updateFaculty = async (req, res) => {
  const { id } = req.params;
  const { name, email, department, password, section } = req.body;

  console.log("UPDATE FACULTY - ID:", id);
  console.log("UPDATE FACULTY - Data received:", { name, email, department, section, hasPassword: !!password });

  try {
    let query = "UPDATE faculty SET name = ?, email = ?, department = ?, section = ? WHERE id = ?";
    let params = [name, email, department, section, id];

    if (password) {
      const hashedPassword = await require("bcryptjs").hash(password, 10);
      query = "UPDATE faculty SET name = ?, email = ?, department = ?, password = ?, section = ? WHERE id = ?";
      params = [name, email, department, hashedPassword, section, id];
    }

    console.log("UPDATE FACULTY - Query:", query);
    console.log("UPDATE FACULTY - Params:", params);

    db.query(query, params, (err, result) => {
      if (err) {
        console.error("UPDATE FACULTY ERROR:", err);
        return res.status(500).json({ message: "DB Error: " + err.sqlMessage });
      }

      console.log("UPDATE FACULTY - Success, rows affected:", result.affectedRows);

      const io = req.app.get("io");
      if (io) io.emit("faculty-changed", { action: "updated", id });

      res.json({ message: "Faculty updated" });
    });
  } catch (e) {
    console.error("UPDATE FACULTY CATCH ERROR:", e);
    res.status(500).json({ message: "Error: " + e.message });
  }
};

exports.updateCourse = (req, res) => {
  const { id } = req.params;
  const { code, title, faculty_id, section } = req.body;

  const query = "UPDATE courses SET course_code = ?, course_name = ?, faculty_id = ?, section = ? WHERE id = ?";
  db.query(query, [code, title, faculty_id || null, section, id], (err) => {
    if (err) return res.status(500).json({ message: "DB Error" });

    const io = req.app.get("io");
    if (io) io.emit("course-changed", { action: "updated", id });

    res.json({ message: "Course updated" });
  });
};
