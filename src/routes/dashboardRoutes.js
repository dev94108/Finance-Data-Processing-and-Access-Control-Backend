const express = require("express");
const router = express.Router();
const {
  getSummary,
  getCategoryTotals,
  getRecentActivity,
  getMonthlyTrends,
  getWeeklyTrends,
} = require("../controllers/dashboardController");
const { protect, authorize } = require("../middlewares/auth");
const { ROLES } = require("../models/User");

// All dashboard routes require authentication
// Analysts and Admins can access dashboard analytics
router.use(protect, authorize(ROLES.ANALYST, ROLES.ADMIN));

router.get("/summary", getSummary);
router.get("/categories", getCategoryTotals);
router.get("/recent", getRecentActivity);
router.get("/trends/monthly", getMonthlyTrends);
router.get("/trends/weekly", getWeeklyTrends);

module.exports = router;
