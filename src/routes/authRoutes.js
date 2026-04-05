const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middlewares/auth");
const { registerRules, loginRules, validate } = require("../middlewares/validate");
const { authLimiter } = require("../config/rateLimiter");


// Role is always defaulted to 'viewer' on self-registration.
// Only an admin can elevate a user's role via PUT /api/users/:id
router.post("/register", authLimiter, registerRules, validate, register);
router.post("/login", authLimiter, loginRules, validate, login);
router.get("/me", protect, getMe);

module.exports = router;
