const express = require("express");
const InventoryService = require("../services/InventoryService");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { allowRoles } = require("../middlewares/role.middleware");

const router = express.Router();

router.use(authMiddleware, allowRoles("manager", "salesperson", "warehouse_staff"));
router.get("/", async (req, res, next) => {
  try {
    res.json({ data: await InventoryService.list() });
  } catch (error) {
    next(error);
  }
});
router.get("/:productId/movements", async (req, res, next) => {
  try {
    res.json({ data: await InventoryService.movements(req.params.productId) });
  } catch (error) {
    next(error);
  }
});
router.get("/:productId", async (req, res, next) => {
  try {
    res.json({ data: await InventoryService.get(req.params.productId) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
