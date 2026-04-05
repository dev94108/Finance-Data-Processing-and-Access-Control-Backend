const express = require("express");
const router = express.Router();
const {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
} = require("../controllers/recordController");
const { protect, authorize } = require("../middlewares/auth");
const {
  recordRules,
  updateRecordRules,
  paginationRules,
  mongoIdRule,
  validate,
} = require("../middlewares/validate");
const { ROLES } = require("../models/User");

// All record routes require authentication
router.use(protect);

// Viewers and above can read records
router.get(
  "/",
  authorize(ROLES.VIEWER, ROLES.ANALYST, ROLES.ADMIN),
  paginationRules,
  validate,
  getAllRecords
);

router.get(
  "/:id",
  authorize(ROLES.VIEWER, ROLES.ANALYST, ROLES.ADMIN),
  mongoIdRule,
  validate,
  getRecordById
);

// Only admin can create, update, delete records
router.post(
  "/",
  authorize(ROLES.ADMIN),
  recordRules,
  validate,
  createRecord
);

router.put(
  "/:id",
  authorize(ROLES.ADMIN),
  mongoIdRule,
  updateRecordRules,
  validate,
  updateRecord
);

router.delete(
  "/:id",
  authorize(ROLES.ADMIN),
  mongoIdRule,
  validate,
  deleteRecord
);

module.exports = router;
