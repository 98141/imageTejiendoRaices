const router = require("express").Router();
const { login, logout, me } = require("../controllers/authController");
const { requireAdmin } = require("../middleware/authMiddleware");
const rateLimit = require("express-rate-limit");

/* Rate limit login */
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/login", loginLimiter, login);
router.post("/logout", requireAdmin, logout);
router.get("/me", requireAdmin, me);

module.exports = router;
