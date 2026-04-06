const rateLimit = require("express-rate-limit");

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000,   // Limit to 10000 requests per 15 minutes for all routes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes.",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,  // Limit to 1000 requests per 15 minutes for auth routes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login/register attempts, please try again after 15 minutes.",
  },
});

module.exports = { globalLimiter, authLimiter };
