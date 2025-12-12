const router = require("express").Router();
const ctrl = require("../controllers/publicController");

router.get("/navigation", ctrl.navigation);
router.get("/designs", ctrl.designs);

module.exports = router;
