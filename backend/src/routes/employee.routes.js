const express = require("express");
const EmployeeService = require("../services/EmployeeService");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { allowRoles } = require("../middlewares/role.middleware");

const router = express.Router();

router.use(authMiddleware, allowRoles("manager"));
router.get("/", async (req, res, next) => {
  try {
    res.json({ data: await EmployeeService.list() });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
