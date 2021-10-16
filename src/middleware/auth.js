const catchAsyncError = require("../middleware/catchAsyncError.js");
const ErrorHandler = require("../utils/errorHandler.js");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");

exports.isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
  const { token } = req.signedCookies;

  if (!token) {
    return next(new ErrorHandler("Please login to access this resource", 401));
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decodedData.id);

  next();
});

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Roles: ${req.user.role} is not allowed to access this resource`,
          403
        )
      );
    }
    next();
  };
};
