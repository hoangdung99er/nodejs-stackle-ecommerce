const express = require("express");
const router = express.Router();
const {
  processPayment,
  sendStripeApiKey
} = require("../controllers/paymentController.js");
const {
  isAuthenticatedUser,
  authorizeRoles
} = require("../middleware/auth.js");

router.route("/payment/process").post(isAuthenticatedUser, processPayment);

router.route("/stripekey").get(isAuthenticatedUser, sendStripeApiKey);

module.exports = router;
