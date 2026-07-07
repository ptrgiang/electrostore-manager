function validate(schema, source = "body") {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const error = new Error("Validation failed");
      error.status = 400;
      error.errors = result.error.flatten();
      next(error);
      return;
    }

    req[source] = result.data;
    next();
  };
}

module.exports = { validate };
