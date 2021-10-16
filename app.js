const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const morgan = require("morgan");
const product = require("./src/routes/productRoute");
const user = require("./src/routes/userRoute");
const order = require("./src/routes/orderRoute");
const errorMiddleware = require("./src/middleware/error.js");
const ErrorHandler = require("./src/utils/errorHandler.js");
const cookieParser = require("cookie-parser");
const NotFound = require("./src/middleware/notFound.js");
const cors = require("cors");
const isProduct = process.env.NODE_ENV === "production";
const fileUpload = require("express-fileupload");

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  {
    flags: "a"
  }
);

//Middleware handle req
app.use(
  isProduct ? morgan("combined", { stream: accessLogStream }) : morgan("dev")
);

app.use(fileUpload({
  createParentPath :true
}));
app.use(cors());
// Handle request to json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));


//Routes import
app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);

app.use(NotFound);
app.use(errorMiddleware);

module.exports = app;
