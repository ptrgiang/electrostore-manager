const express = require("express");
const WarehouseService = require("../services/WarehouseService");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { allowRoles } = require("../middlewares/role.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { exportPayload, importPayload } = require("./schemas");

const router = express.Router();

router.use(authMiddleware, allowRoles("manager", "warehouse_staff"));
router.post("/import", validate(importPayload), async (req, res, next) => {
  try {
    res.status(201).json({ data: await WarehouseService.importStock(req.body, req.user) });
  } catch (error) {
    next(error);
  }
});
router.post("/export", validate(exportPayload), async (req, res, next) => {
  try {
    res.status(201).json({ data: await WarehouseService.exportStock(req.body, req.user) });
  } catch (error) {
    next(error);
  }
});
router.get("/movements", async (req, res, next) => {
  try {
    res.json({ data: await WarehouseService.movements() });
  } catch (error) {
    next(error);
  }
});
router.get("/movements/:id", async (req, res, next) => {
  try {
    res.json({ data: await WarehouseService.movement(req.params.id) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
