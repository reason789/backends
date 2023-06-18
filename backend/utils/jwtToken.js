const { cookie } = require("@netlify/functions");

const sendToken = (user, statusCode, res) => {
  // console.log(user);
  const token = user.getJWTToken();

  // options for cokkie
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000 // converted into miliSecond
    ),
    httpOnly: true,
    // secure: true,
    sameSite: "None",
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    token,
  });
};

module.exports = sendToken;
