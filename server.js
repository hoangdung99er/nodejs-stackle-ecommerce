const app = require("./app");
const connectDatabase = require("./config/database.js");
const cloudinary = require("cloudinary");
// require("dotenv").config({path : "backend/config/config.env/....."})

//Handling Uncaught Exception
process.on("uncaughtException", err => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to Uncaught Exception`);
  process.exit(1);
});

if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({ path: "config/config.env" });
}

connectDatabase();

cloudinary.config({
  cloud_name : process.env.CLOUDINARY_NAME,
  api_key : process.env.CLOUDINARY_API_KEY,
  api_secret : process.env.CLOUDINARY_API_SECRET,
  secure : true,
})
const server = app.listen(process.env.PORT, () => {
  console.log(`SERVER is working on port ${process.env.PORT}`);
});

// Unhandled Promise Rejection
process.on("unhandledRejection", err => {
  console.log(`Error ${err.message}`);
  console.log(`Shutting down the server due to unhandled Promise Rejection`);

  server.close(() => {
    process.exit(1);
  });
});
