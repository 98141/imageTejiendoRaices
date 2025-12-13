const router = require("express").Router();
const { requireAdmin } = require("../middleware/authMiddleware");
const ctrl = require("../controllers/adminSubcategoryController");

router.use(requireAdmin);

router.get("/", ctrl.list);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

module.exports = router;
