const router = require("express").Router();
const { requireAdmin } = require("../middleware/authMiddleware");
const ctrl = require("../controllers/adminNotificationController");

router.get("/stream", requireAdmin, ctrl.stream);

module.exports = router;
