const express = require("express");
const router = express.Router();
const facultyController = require("../controllers/facultyController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/dashboard", verifyToken, facultyController.getDashboardData);
router.post("/activity", verifyToken, facultyController.postActivity);

module.exports = router;
