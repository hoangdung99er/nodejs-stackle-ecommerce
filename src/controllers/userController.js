const ErrorHandler = require("../utils/errorHandler.js");
const catchAsyncError = require("../middleware/catchAsyncError.js");
const User = require("../models/userModel.js");
const Product = require("../models/productModel.js");
const sendToken = require("../utils/sendToken.js");
const sendEmail = require("../utils/sendEmail.js");
const crypto = require("crypto");
const cloudinary = require("cloudinary");

// Register a user
exports.register = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;
  
  console.log(req.files)
  
  if(!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("No Files were uploaded", 400));
  }
  
  const myCloud = await cloudinary.v2.uploader.upload(req.files.avatar, {
    folder : "avatars",
    width : 150,
    crop : "scale",
  })

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url
    }
  });

  sendToken(user, 201, res);
});

// Login user handler
exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Please enter Email & Password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    return next(new ErrorHandler("Invalid password", 401));
  }

  sendToken(user, 200, res);
});

// Logout handler
exports.logout = catchAsyncError(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: "Logged Out"
  });
});

// Forgot Password
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found!", 404));
  }

  // Get Reset password token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then please ignore it`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Ecommerce Password Recovery`,
      message
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpired = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

// Reset password
exports.resetPassword = catchAsyncError(async (req, res, next) => {
  const { password, confirmPassword } = req.body;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpired: { $gt: Date.now() }
  });

  if (!user) {
    return next(
      new ErrorHandler(
        "Reset password token is invalid or has been expired!",
        400
      )
    );
  }

  if (password !== confirmPassword) {
    return next(new ErrorHandler("Password does not match!", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpired = undefined;

  await user.save();

  sendToken(user, 200, res);
});

// Get User Detail
exports.getUserDetails = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user
  });
});

// Update password
exports.updatePassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Old password is incorrect!", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not match!", 400));
  }

  user.password = req.body.newPassword;

  await user.save();

  sendToken(user, 200, res);
});

// Update name and email
exports.updateProfile = catchAsyncError(async (req, res, next) => {
  const { name, email } = req.body;
  const newUserData = {
    name,
    email
  };

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    userFindAndModify: false
  });

  res.status(200).json({
    success: true
  });
});

// Update all users -- (admin)
exports.getAllUser = catchAsyncError(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users
  });
});

// Get single user (admin)
exports.getSingleUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with id! ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    user
  });
});

// Update User (admin role)
exports.updateUser = catchAsyncError(async (req, res, next) => {
  const { name, email, role } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with id! ${req.params.id}`, 404)
    );
  }

  user.name = name;
  user.email = email;
  user.role = role;

  await user.save();

  res.status(200).json({
    success: true
  });
});

// Delete user (Admin role)
exports.deleteUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with id! ${req.params.id}`, 404)
    );
  }

  await user.remove();

  res.status(200).json({
    success: true,
    message: "User deleted successfully"
  });
});


