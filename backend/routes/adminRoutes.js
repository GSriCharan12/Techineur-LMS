const express = require("express");
const router = express.Router();
const { getDashboardStats, getAllCourses, addCourse, updateCourse, deleteCourse, getFacultyList, addFaculty, updateFaculty, deleteFaculty } = require("../controllers/adminController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/stats", verifyToken, getDashboardStats);
router.get("/courses", getAllCourses);
router.post("/courses", verifyToken, addCourse);
router.delete("/courses/:id", verifyToken, deleteCourse);
router.put("/courses/:id", verifyToken, updateCourse);
router.get("/faculty-list", verifyToken, getFacultyList);
router.post("/faculty", verifyToken, addFaculty);
router.put("/faculty/:id", verifyToken, updateFaculty);
router.delete("/faculty/:id", verifyToken, deleteFaculty);

module.exports = router;
