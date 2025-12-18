const jwt = require("jsonwebtoken");
const AdminUser = require("../models/AdminUser");
const { z } = require("zod");
const { zCleanString } = require("../utils/sanitize");

const COOKIE_NAME = process.env.COOKIE_NAME || "admin_token";

const loginSchema = z.object({
  email: z.string().email(),
  password: zCleanString(200),
});

function setAuthCookie(res, token) {
  const secure =
    String(process.env.COOKIE_SECURE || "")
      .trim()
      .toLowerCase() === "true" || process.env.NODE_ENV === "production";


  const sameSite = secure ? "none" : "lax";

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
    maxAge: 24 * 60 * 60 * 1000,
  });
}

exports.login = async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const admin = await AdminUser.findOne({ email: email.toLowerCase() });
    if (!admin || !admin.isActive || !admin.verifyPassword(password)) {
      res.status(401);
      throw new Error("Credenciales inválidas");
    }

    const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
      subject: admin._id.toString(),
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    });

    setAuthCookie(res, token);
    res.json({ ok: true, admin: { email: admin.email, role: admin.role } });
  } catch (e) {
    next(e);
  }
};

exports.logout = async (req, res) => {
  const secure =
    String(process.env.COOKIE_SECURE || "")
      .trim()
      .toLowerCase() === "true" || process.env.NODE_ENV === "production";

  const sameSite = secure ? "none" : "lax";

  res.clearCookie(COOKIE_NAME, {
    path: "/",
    secure,
    sameSite,
  });

  res.json({ ok: true });
};


exports.me = async (req, res) => {
  res.json({ ok: true, admin: req.admin });
};
