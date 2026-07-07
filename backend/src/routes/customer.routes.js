const express = require("express");
const CustomerService = require("../services/CustomerService");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { allowRoles } = require("../middlewares/role.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { customerPayload, customerUpdatePayload } = require("./schemas");

const router = express.Router();

router.use(authMiddleware);
router.get("/search", allowRoles("manager", "salesperson"), async (req, res, next) => {
  try {
    res.json({ data: await CustomerService.searchByPhone(req.query.phone) });
  } catch (error) {
    next(error);
  }
});
router.get("/", allowRoles("manager", "salesperson"), async (req, res, next) => {
  try {
    res.json({ data: await CustomerService.list(req.query) });
  } catch (error) {
    next(error);
  }
});
router.get("/:id/history", allowRoles("manager", "salesperson"), async (req, res, next) => {
  try {
    res.json({ data: await CustomerService.history(req.params.id) });
  } catch (error) {
    next(error);
  }
});
router.get("/:id", allowRoles("manager", "salesperson"), async (req, res, next) => {
  try {
    res.json({ data: await CustomerService.get(req.params.id) });
  } catch (error) {
    next(error);
  }
});
router.post("/", allowRoles("manager", "salesperson"), validate(customerPayload), async (req, res, next) => {
  try {
    res.status(201).json({ data: await CustomerService.create(req.body) });
  } catch (error) {
    next(error);
  }
});
router.put("/:id", allowRoles("manager", "salesperson"), validate(customerUpdatePayload), async (req, res, next) => {
  try {
    res.json({ data: await CustomerService.update(req.params.id, req.body) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
