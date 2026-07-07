const jwt = require("jsonwebtoken");
const { unauthorized } = require("./error.middleware");

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name
    },
    process.env.JWT_SECRET || "dev-secret",
    { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
  );
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    next(unauthorized("Missing bearer token"));
    return;
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    next();
  } catch (error) {
    next(unauthorized("Invalid or expired token"));
  }
}

module.exports = { authMiddleware, signToken };
