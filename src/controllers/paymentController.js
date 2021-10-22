const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const ErrorHandler = require("../utils/errorHandler.js");
const catchAsyncError = require("../middleware/catchAsyncError.js");

exports.processPayment = catchAsyncError(async (req, res, next) => {
  const session = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: "usd",
    metadata: {
      company: "Stackle E-commerce"
    }
  });
  
  res.status(200).json({
    success : true,
    client_secret : session.client_secret
  })
});

exports.sendStripeApiKey = catchAsyncError(async (req, res, next) => {
  
  res.status(200).json({
    stripeApiKey : process.env.STRIPE_PUBLIC_KEY
  })
});
