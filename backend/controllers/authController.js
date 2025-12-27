const jwt = require("jsonwebtoken");
const db = require("../config/db");
const bcrypt = require("bcryptjs");

exports.loginUser = (req, res) => {
  const { email, password } = req.body;

  // 1. Check Admin Credentials (from .env)
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign(
      { email, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    // Return explicit role and name
    return res.json({ token, role: "admin", name: "Admin" });
  }

  // 2. Check Database for Student
  const query = "SELECT * FROM students WHERE email = ?";
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error("Login Error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length > 0) {
      const student = results[0];
      try {
        const isMatch = await bcrypt.compare(password, student.password);
        if (isMatch) {
          const token = jwt.sign(
            { id: student.id, email: student.email, role: "student" },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
          );
          return res.json({ token, role: "student", name: student.name });
        }
      } catch (bcryptErr) {
        console.error(bcryptErr);
      }
    }

    // 3. Check Database for Faculty (if not student)
    const facultyQuery = "SELECT * FROM faculty WHERE email = ?";
    db.query(facultyQuery, [email], async (err, fResults) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
      }

      if (fResults.length > 0) {
        const faculty = fResults[0];
        try {
          const isMatch = await bcrypt.compare(password, faculty.password);
          if (isMatch) {
            const token = jwt.sign(
              { id: faculty.id, email: faculty.email, role: "faculty" },
              process.env.JWT_SECRET,
              { expiresIn: "1h" }
            );
            return res.json({ token, role: "faculty", name: faculty.name });
          }
        } catch (e) { console.error(e); }
      }

      return res.status(401).json({ message: "Invalid credentials" });
    });
  });
};
