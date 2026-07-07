function notFound(message = "Not found") {
  const error = new Error(message);
  error.status = 404;
  return error;
}

function badRequest(message = "Bad request") {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function forbidden(message = "Forbidden") {
  const error = new Error(message);
  error.status = 403;
  return error;
}

function unauthorized(message = "Unauthorized") {
  const error = new Error(message);
  error.status = 401;
  return error;
}

function errorMiddleware(error, req, res, next) {
  if (res.headersSent) {
    next(error);
    return;
  }

  const status = error.status || 500;
  res.status(status).json({
    message: error.message || "Internal server error",
    errors: error.errors
  });
}

module.exports = {
  badRequest,
  errorMiddleware,
  forbidden,
  notFound,
  unauthorized
};
