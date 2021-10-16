const ErrorHandler = require("../utils/errorHandler");
module.exports = (req, res, next) => {
  return next(new ErrorHandler("Could not found this route", 404));
};
