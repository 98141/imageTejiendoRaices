const router = require("express").Router();
const { requireAdmin } = require("../middleware/authMiddleware");
const ctrl = require("../controllers/adminOrderController");

router.use(requireAdmin);

router.get("/", ctrl.list);
router.patch("/:id/status", ctrl.updateStatus);

module.exports = router;
