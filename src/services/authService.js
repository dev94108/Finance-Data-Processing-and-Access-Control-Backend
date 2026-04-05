const jwt = require("jsonwebtoken");
const { User } = require("../models/User");

/**
 * Include both id AND role in the token.
 *
 * Why role in token?
 *  - Allows a first-pass role check without a DB hit on every request.
 *  - The auth middleware still fetches the user from DB, so if an admin
 *    changes someone's role, the next request will reflect the real DB role.
 *  - If the token role and DB role ever mismatch, we reject the request,
 *    effectively invalidating old tokens after a role change.
 */
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error("User with this email already exists.");
    error.statusCode = 409;
    throw error;
  }

  // Role is always defaulted to 'viewer' on self-registration.
  // Only an admin can elevate a user's role via PUT /api/users/:id
  const user = await User.create({ name, email, password });
  const token = generateToken(user._id, user.role);

  return { user, token };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");
  //comparePassword is defined in the User model and uses bcrypt to compare the hashed password,it is method of user instance.
  if (!user || !(await user.comparePassword(password))) { 
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error("Your account has been deactivated. Contact an admin.");
    error.statusCode = 403;
    throw error;
  }

  const token = generateToken(user._id, user.role);
  user.password = undefined;

  return { user, token };
};

module.exports = { registerUser, loginUser };
