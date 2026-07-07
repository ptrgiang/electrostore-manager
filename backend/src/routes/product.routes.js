const express = require("express");
const ProductService = require("../services/ProductService");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { allowRoles } = require("../middlewares/role.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { productPayload, productUpdatePayload } = require("./schemas");

const router = express.Router();

router.use(authMiddleware);
router.get("/low-stock", allowRoles("manager", "salesperson", "warehouse_staff"), async (req, res, next) => {
  try {
    res.json({ data: await ProductService.lowStock() });
  } catch (error) {
    next(error);
  }
});
router.get("/", allowRoles("manager", "salesperson", "warehouse_staff"), async (req, res, next) => {
  try {
    res.json({ data: await ProductService.list(req.query) });
  } catch (error) {
    next(error);
  }
});
router.get("/:id", allowRoles("manager", "salesperson", "warehouse_staff"), async (req, res, next) => {
  try {
    res.json({ data: await ProductService.get(req.params.id) });
  } catch (error) {
    next(error);
  }
});
router.post("/", allowRoles("manager"), validate(productPayload), async (req, res, next) => {
  try {
    res.status(201).json({ data: await ProductService.create(req.body) });
  } catch (error) {
    next(error);
  }
});
router.put("/:id", allowRoles("manager"), validate(productUpdatePayload), async (req, res, next) => {
  try {
    res.json({ data: await ProductService.update(req.params.id, req.body) });
  } catch (error) {
    next(error);
  }
});
router.patch("/:id/stop-selling", allowRoles("manager"), async (req, res, next) => {
  try {
    res.json({ data: await ProductService.stopSelling(req.params.id) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
