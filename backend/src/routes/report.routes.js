const express = require("express");
const ReportService = require("../services/ReportService");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { allowRoles } = require("../middlewares/role.middleware");

const router = express.Router();

router.use(authMiddleware, allowRoles("manager"));
router.get("/revenue", async (req, res, next) => {
  try {
    res.json({ data: await ReportService.revenue(req.query) });
  } catch (error) {
    next(error);
  }
});
router.get("/top-products", async (req, res, next) => {
  try {
    res.json({ data: await ReportService.topProducts(req.query) });
  } catch (error) {
    next(error);
  }
});
router.get("/low-stock", async (req, res, next) => {
  try {
    res.json({ data: await ReportService.lowStock() });
  } catch (error) {
    next(error);
  }
});
router.get("/inventory-status", async (req, res, next) => {
  try {
    res.json({ data: await ReportService.inventoryStatus() });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
