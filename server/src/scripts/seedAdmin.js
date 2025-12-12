require("dotenv").config();
const { connectDB } = require("../config/db");
const AdminUser = require("../models/AdminUser");

(async () => {
  await connectDB();

  const email = (process.env.ADMIN_EMAIL || "").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";

  if (!email || !password) {
    console.error("ADMIN_EMAIL y ADMIN_PASSWORD son requeridos en .env");
    process.exit(1);
  }

  const existing = await AdminUser.findOne({ email });
  if (existing) {
    console.log("Admin ya existe:", email);
    process.exit(0);
  }

  const { salt, hash } = AdminUser.hashPassword(password);

  await AdminUser.create({
    email,
    passwordSalt: salt,
    passwordHash: hash,
    role: "admin",
    isActive: true,
  });

  console.log("Admin creado:", email);
  process.exit(0);
})();
