const express = require("express");
const InvoiceService = require("../services/InvoiceService");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { allowRoles } = require("../middlewares/role.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { salePayload } = require("./schemas");

const router = express.Router();

router.use(authMiddleware);
router.post("/sale", allowRoles("manager", "salesperson"), validate(salePayload), async (req, res, next) => {
  try {
    res.status(201).json({ message: "Sale completed successfully", data: await InvoiceService.createSale(req.body, req.user) });
  } catch (error) {
    next(error);
  }
});
router.get("/", allowRoles("manager", "salesperson"), async (req, res, next) => {
  try {
    res.json({ data: await InvoiceService.list() });
  } catch (error) {
    next(error);
  }
});
router.get("/:id", allowRoles("manager", "salesperson"), async (req, res, next) => {
  try {
    res.json({ data: await InvoiceService.get(req.params.id) });
  } catch (error) {
    next(error);
  }
});
router.patch("/:id/refund", allowRoles("manager"), async (req, res, next) => {
  try {
    res.json({ data: await InvoiceService.refund(req.params.id) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
