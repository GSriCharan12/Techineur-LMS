const jwt = require("jsonwebtoken");
const db = require("../config/db");
const bcrypt = require("bcryptjs");

exports.loginUser = (req, res) => {
  const { email, password, role } = req.body;

  console.log(`LOGIN ATTEMPT: Email=${email}, Role=${role || 'any'}`);

  // 1. Check Admin Credentials (Always first)
  if (process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    console.log("Logged in as Admin");
    const token = jwt.sign({ email, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1h" });
    return res.json({ token, role: "admin", name: "Admin" });
  }

  // Helper function to check student
  const checkStudent = (next) => {
    db.query("SELECT * FROM students WHERE email = ?", [email], async (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });
      if (results.length > 0) {
        const student = results[0];
        try {
          if (await bcrypt.compare(password, student.password)) {
            const token = jwt.sign({ id: student.id, email: student.email, role: "student" }, process.env.JWT_SECRET, { expiresIn: "1h" });
            return res.json({ token, role: "student", name: student.name });
          }
        } catch (e) { }
      }
      next();
    });
  };

  // Helper function to check faculty
  const checkFaculty = (next) => {
    db.query("SELECT * FROM faculty WHERE email = ?", [email], async (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });
      if (results.length > 0) {
        const faculty = results[0];
        try {
          if (await bcrypt.compare(password, faculty.password)) {
            const token = jwt.sign({ id: faculty.id, email: faculty.email, role: "faculty" }, process.env.JWT_SECRET, { expiresIn: "1h" });
            return res.json({ token, role: "faculty", name: faculty.name });
          }
        } catch (e) { }
      }
      next();
    });
  };

  const sendInvalid = () => res.status(401).json({ message: "Invalid credentials" });

  // Logic Flow based on requested Role
  if (role === 'faculty') {
    checkFaculty(() => {
      // If faculty login failed, we technically shouldn't check student, but for safety/fallback we can, OR strictly fail.
      // Let's strictly fail if they asked for faculty login to avoid confusion.
      sendInvalid();
    });
  } else if (role === 'student') {
    checkStudent(() => {
      sendInvalid();
    });
  } else {
    // Legacy / Default: Check Student -> Then Faculty
    checkStudent(() => {
      checkFaculty(() => {
        sendInvalid();
      });
    });
  }
};
