exports.notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Not found: ${req.method} ${req.originalUrl}`));
};

exports.errorHandler = (err, req, res, next) => {
  const status =
    res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  const payload = {
    message: err.message || "Server error",
  };

  if (process.env.NODE_ENV !== "production") {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
};
