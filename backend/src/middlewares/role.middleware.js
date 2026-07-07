const { forbidden } = require("./error.middleware");

function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(forbidden("You do not have access to this module"));
      return;
    }

    next();
  };
}

module.exports = { allowRoles };
