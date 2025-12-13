const jwt = require("jsonwebtoken");
const AdminUser = require("../models/AdminUser");

const COOKIE_NAME = process.env.COOKIE_NAME || "admin_token";

exports.requireAdmin = async (req, res, next) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];

    // Caso esperado: no autenticado -> responder aquí (no errorHandler)
    if (!token) {
      return res.status(401).json({ message: "No autenticado" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // Token inválido/expirado -> 401 limpio
      return res.status(401).json({ message: "Token inválido o expirado" });
    }

    const admin = await AdminUser.findById(decoded.sub).lean();
    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: "Usuario no válido" });
    }

    req.admin = {
      id: String(admin._id),
      email: admin.email,
      role: admin.role,
    };

    return next();
  } catch (err) {
    // Aquí ya son fallos no esperados -> 500 real
    return next(err);
  }
};
