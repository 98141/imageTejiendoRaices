const router = require("express").Router();
const { requireAdmin } = require("../middleware/authMiddleware");
const { uploadImage10mb } = require("../middleware/uploadMiddleware");
const ctrl = require("../controllers/adminDesignController");

router.use(requireAdmin);

router.get("/", ctrl.list);
router.post("/", uploadImage10mb.single("image"), ctrl.create);
router.put("/:id", uploadImage10mb.single("image"), ctrl.update);
router.delete("/:id", ctrl.remove);

module.exports = router;
