const ErrorHandler = require("../utils/errorHandler");

module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;

  error.message = error.message || "Internal Server Error";

  // Catch wrong mongo id object
  if (error.name === "CastError") {
    const message = `Resource not found. Invalid: ${error.path}`;
    error = new ErrorHandler(message, 404);
  }

  if (error.name === "ValidationError") {
    const message = Object.values(error.errors)
      .map(item => item.message)
      .join(",");
    error = new ErrorHandler(message, 400);
  }

  if (error.code === 11000) {
    const message = `Duplicate ${Object.keys(error.keyValue)} entered`;
    error = new ErrorHandler(message, 400);
  }

  if (error.name === "JsonWebTokenError") {
    const message = `Json web token is invalid, try again`;
    error = new ErrorHandler(message, 400);
  }

  if (error.name === "TokenExpiredError") {
    const message = `Json web token is expired, try again`;
    error = new ErrorHandler(message, 400);
  }

  res.status(error.statusCode).json({
    success: false,
    error: error.message
  });
};
