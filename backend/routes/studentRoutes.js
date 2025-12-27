const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { setSection, getMyCourses, getStudentProfile, getAttendance, getGrades, submitFeedback, getFaculties } = require("../controllers/studentController");

// Protected routes for students
router.get("/profile", verifyToken, getStudentProfile);
router.post("/enroll-section", verifyToken, setSection);
router.get("/my-courses", verifyToken, getMyCourses);
router.get("/my-attendance", verifyToken, getAttendance);
router.get("/my-grades", verifyToken, getGrades);
router.post("/submit-feedback", verifyToken, submitFeedback);
router.get("/faculties", verifyToken, getFaculties);
router.get("/materials", verifyToken, require("../controllers/studentController").getMaterials);

module.exports = router;
