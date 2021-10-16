const express = require("express");
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetails,
  createProductReview,
  getProductReviews,
  deleteReviews
} = require("../controllers/productController");
const {
  isAuthenticatedUser,
  authorizeRoles
} = require("../middleware/auth.js");

const router = express.Router();

router.route("/products").get(getAllProducts);
router
  .route("/product/new")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createProduct);
router
  .route("/product/:id")
  .put(isAuthenticatedUser, updateProduct)
  .delete(isAuthenticatedUser, deleteProduct);

router.route("/product/:id").get(getProductDetails);

router.route("/review").post(isAuthenticatedUser, createProductReview);

router
  .route("/reviews")
  .get(getProductReviews)
  .delete(isAuthenticatedUser, deleteReviews);

module.exports = router;
