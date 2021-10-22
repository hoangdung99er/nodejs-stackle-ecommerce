// Create token and saving in cookie
const sendToken = (user, statusCode, res) => {
  const token = user.getJWTToken();

  // Options for cookie
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    signed: true,
    sameSite : "none",
    secure : true,
    // sameSite: process.env.NODE_ENV === "development" ? true : "none",
    //   secure: process.env.NODE_ENV === "development" ? false : true,
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      user,
      token
    });
};

module.exports = sendToken;
