const { body, query, param, validationResult } = require("express-validator");
const { CATEGORIES } = require("../models/FinancialRecord");
const { ROLES } = require("../models/User");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// Public registration — role is NOT accepted (always defaults to viewer)
const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ min: 2, max: 50 }).withMessage("Name must be 2-50 characters"),
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

// Admin creating a user — role IS accepted and required
const adminCreateUserRules = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ min: 2, max: 50 }).withMessage("Name must be 2-50 characters"),
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("role").notEmpty().withMessage("Role is required").isIn(Object.values(ROLES)).withMessage(`Role must be one of: ${Object.values(ROLES).join(", ")}`),
];

const loginRules = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

const recordRules = [
  body("amount").isFloat({ min: 0.01 }).withMessage("Amount must be a positive number"),
  body("type").isIn(["income", "expense"]).withMessage("Type must be 'income' or 'expense'"),
  body("category").isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(", ")}`),
  body("date").optional().isISO8601().withMessage("Date must be a valid ISO 8601 date"),
  body("notes").optional().isLength({ max: 500 }).withMessage("Notes cannot exceed 500 characters"),
];

const updateRecordRules = [
  body("amount").optional().isFloat({ min: 0.01 }).withMessage("Amount must be a positive number"),
  body("type").optional().isIn(["income", "expense"]).withMessage("Type must be 'income' or 'expense'"),
  body("category").optional().isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(", ")}`),
  body("date").optional().isISO8601().withMessage("Date must be a valid ISO 8601 date"),
  body("notes").optional().isLength({ max: 500 }).withMessage("Notes cannot exceed 500 characters"),
];

const updateUserRules = [
  body("name").optional().trim().isLength({ min: 2, max: 50 }).withMessage("Name must be 2-50 characters"),
  body("role").optional().isIn(Object.values(ROLES)).withMessage(`Role must be one of: ${Object.values(ROLES).join(", ")}`),
  body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
];

const paginationRules = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
];

const mongoIdRule = [
  param("id").isMongoId().withMessage("Invalid ID format"),
];

module.exports = {
  validate,
  registerRules,
  adminCreateUserRules,
  loginRules,
  recordRules,
  updateRecordRules,
  updateUserRules,
  paginationRules,
  mongoIdRule,
};
