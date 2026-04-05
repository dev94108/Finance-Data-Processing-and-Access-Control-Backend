const express = require("express");
const router = express.Router();
const { createUser, getAllUsers, getUserById, updateUser, deleteUser } = require("../controllers/userController");
const { protect, authorize } = require("../middlewares/auth");
const { adminCreateUserRules, updateUserRules, paginationRules, mongoIdRule, validate } = require("../middlewares/validate");
const { ROLES } = require("../models/User");

// All user management routes require admin access
router.use(protect, authorize(ROLES.ADMIN));

// Admin creates a user directly with an explicit role (viewer / analyst / admin)
router.post("/", adminCreateUserRules, validate, createUser);

router.get("/", paginationRules, validate, getAllUsers);
router.get("/:id", mongoIdRule, validate, getUserById);
router.put("/:id", mongoIdRule, updateUserRules, validate, updateUser);
router.delete("/:id", mongoIdRule, validate, deleteUser);

module.exports = router;
