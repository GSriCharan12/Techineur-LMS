const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const studentCtrl = require("../controllers/adminStudentController");

router.use(verifyToken);

router.get("/", studentCtrl.getStudents);
router.post("/", studentCtrl.addStudent);
router.put("/:id", studentCtrl.updateStudent);
router.delete("/:id", studentCtrl.deleteStudent);

module.exports = router;
