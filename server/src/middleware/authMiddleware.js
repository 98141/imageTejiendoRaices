const jwt = require("jsonwebtoken");
const AdminUser = require("../models/AdminUser");

const COOKIE_NAME = process.env.COOKIE_NAME || "admin_token";

exports.requireAdmin = async (req, res, next) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) {
      res.status(401);
      throw new Error("No autenticado");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await AdminUser.findById(decoded.sub);

    if (!admin || !admin.isActive) {
      res.status(401);
      throw new Error("Usuario no válido");
    }

    req.admin = {
      id: admin._id.toString(),
      email: admin.email,
      role: admin.role,
    };
    next();
  } catch (e) {
    res.status(401);
    next(e);
  }
};
