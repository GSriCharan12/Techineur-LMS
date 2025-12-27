const db = require("../config/db"); // keep YOUR existing db path

const bcrypt = require("bcryptjs");

exports.getStudents = (req, res) => {
  db.query("SELECT id, name, email, section FROM students", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

exports.addStudent = async (req, res) => {
  const { name, email, password, section } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "All fields required" });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query(
      "INSERT INTO students (name, email, password, section) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, section || null],
      err => {
        if (err) {
          console.error("ADD STUDENT ERROR:", err);
          return res.status(500).json(err);
        }

        const io = req.app.get("io");
        if (io) io.emit("student-changed", { action: "added" });

        res.json({ message: "Student added successfully" });
      }
    );
  } catch (e) {
    res.status(500).json(e);
  }
};

exports.deleteStudent = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM students WHERE id = ?", [id], err => {
    if (err) {
      console.error("Delete Student Error:", err);
      // Check for Foreign Key Constraint
      if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
        return res.status(400).json({ message: "Cannot delete student due to related records (grades/attendance/feedback)." });
      }
      return res.status(500).json({ message: "DB Error: " + err.sqlMessage });
    }

    const io = req.app.get("io");
    if (io) io.emit("student-changed", { action: "deleted", id });

    res.json({ message: "Student deleted successfully" });
  });
};

exports.updateStudent = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, section } = req.body;

  console.log("UPDATE STUDENT - ID:", id);
  console.log("UPDATE STUDENT - Data received:", { name, email, section, hasPassword: !!password });

  try {
    let query = "UPDATE students SET name = ?, email = ?, section = ? WHERE id = ?";
    let params = [name, email, section, id];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = "UPDATE students SET name = ?, email = ?, password = ?, section = ? WHERE id = ?";
      params = [name, email, hashedPassword, section, id];
    }

    console.log("UPDATE STUDENT - Query:", query);
    console.log("UPDATE STUDENT - Params:", params);

    db.query(query, params, (err, result) => {
      if (err) {
        console.error("UPDATE STUDENT ERROR:", err);
        return res.status(500).json({ message: "DB Error: " + err.sqlMessage });
      }

      console.log("UPDATE STUDENT - Success, rows affected:", result.affectedRows);

      const io = req.app.get("io");
      if (io) io.emit("student-changed", { action: "updated", id });

      res.json({ message: "Student updated successfully" });
    });
  } catch (e) {
    console.error("UPDATE STUDENT CATCH ERROR:", e);
    res.status(500).json({ message: "Error: " + e.message });
  }
};
