const { User, ROLES } = require("../models/User");

const seedDefaultAdmin = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Super Admin";

  if (!email || !password) {
    console.warn(
      "WARNING: ADMIN_EMAIL or ADMIN_PASSWORD not set in .env. Default admin will not be seeded."
    );
    return;
  }

  const existing = await User.findOne({ email });
  if (existing) {
    // Already exists ,make sure they're still admin and active 
    if (existing.role !== ROLES.ADMIN || !existing.isActive) {
      await User.findByIdAndUpdate(existing._id, {
        role: ROLES.ADMIN,
        isActive: true,
      });
      console.log(`Default admin restored: ${email}`);
    } else {
      console.log(`Default admin already exists: ${email}`);
    }
    return;
  }

  await User.create({ name, email, password, role: ROLES.ADMIN });
  console.log(`Default admin seeded: ${email}`);
};

module.exports = seedDefaultAdmin;
