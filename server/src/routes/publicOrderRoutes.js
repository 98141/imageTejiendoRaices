const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const ctrl = require("../controllers/publicOrderController");

const orderLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/orders", orderLimiter, ctrl.create);

module.exports = router;
