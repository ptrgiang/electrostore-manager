const express = require("express");
const { z } = require("zod");
const AuthService = require("../services/AuthService");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");

const router = express.Router();

router.post(
  "/login",
  validate(z.object({ email: z.string().email(), password: z.string().min(1) })),
  async (req, res, next) => {
    try {
      res.json({ data: await AuthService.login(req.body.email, req.body.password) });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/me", authMiddleware, async (req, res, next) => {
  try {
    res.json({ data: await AuthService.me(req.user.id) });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", authMiddleware, (req, res) => {
  res.json({ data: { ok: true } });
});

module.exports = router;
