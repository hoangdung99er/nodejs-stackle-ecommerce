const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler.js");
const catchAsyncError = require("../middleware/catchAsyncError.js");
const ApiFeatures = require("../utils/apiFeatures.js");
const cloudinary = require("cloudinary");

// Create Product
exports.createProduct = catchAsyncError(async (req, res, next) => {
  let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  if (!req.body.images) {
    return next(new ErrorHandler("Product images not found", 404));
  }

  let imagesLink = [];

  for (let i = 0; i < images.length; i++) {
    const myCloud = await cloudinary.v2.uploader.upload(images[i], {
      folder: "products"
    });

    imagesLink.push({
      public_id: myCloud.public_id,
      url: myCloud.secure_url
    });
  }

  req.body.user = req.user.id;
  req.body.images = imagesLink;

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    product
  });
});

//Get all product
exports.getAllProducts = catchAsyncError(async (req, res, next) => {
  const resultPerPage = 10;

  const productCount = await Product.countDocuments();

  const apiFeature = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage);

  // let products = await apiFeature.query;

  const products = await apiFeature.query;

  let filterProductCount = products.length;

  // await apiFeature.pagination(resultPerPage);

  res
    .status(200)
    .json({ success: true, products, productCount, filterProductCount });
});

exports.getAdminAllProducts = catchAsyncError(async (req, res, next) => {
  const products = await Product.find({});

  res.status(200).json({ success: true, products });
});

// Update Product -- Admin
exports.updateProduct = catchAsyncError(async (req, res, next) => {
  const {
    params: { id }
  } = req;

  let product = await Product.findById(id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  if (images !== undefined) {
    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }
  }

  let imagesLink = [];

  for (let i = 0; i < images.length; i++) {
    const myCloud = await cloudinary.v2.uploader.upload(images[i], {
      folder: "products"
    });

    imagesLink.push({
      public_id: myCloud.public_id,
      url: myCloud.secure_url
    });
  }

  req.body.images = imagesLink;

  product = await Product.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  });

  res.status(200).json({
    success: true,
    product
  });
});

// Delete Product -- Admin
exports.deleteProduct = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  //   Remove image from cloudinary
  for (let i = 0; i < product.images.length; i++) {
    await cloudinary.v2.uploader.destroy(product.images[i].public_id);
  }

  await product.remove();

  res.status(200).json({
    success: true,
    message: "Product has been deleted!"
  });
});

// Get products Details
exports.getProductDetails = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    product
  });
});

// Create New Review or Update the review
exports.createProductReview = catchAsyncError(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user.id,
    name: req.user.name,
    rating: Number(rating),
    comment
  };

  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find(
    rev => rev.user.toString() === req.user.id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach(rev => {
      if (rev.user.toString() === req.user.id.toString()) {
        rev.rating = rating;
        rev.comment = comment;
      }
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  let avg = 0;

  product.reviews.forEach(rev => {
    avg += rev.rating;
  });
  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true
  });
});

// Get all reviews of a product
exports.getProductReviews = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews
  });
});

// Admin role - Delete reviews
exports.deleteReviews = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const reviews = product.reviews.filter(
    rev => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;

  reviews.forEach(rev => {
    avg += rev.rating;
  });

  let ratings;
  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = avg / reviews.length;
  }

  const numOfReviews = reviews.length;

  console.log(ratings);
  console.log(reviews);
  console.log(avg);

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews
    },
    { new: true, runValidators: true, useFindAndModify: false }
  );

  res.status(200).json({
    success: true
  });
});
