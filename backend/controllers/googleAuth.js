const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.verifyGoogleToken = async (token) => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience:
      "106662012974-i0bj2f2ns0gjjm6rk6hsdroh3r4ns5mi.apps.googleusercontent.com",
  });
  const payload = ticket.getPayload();
  return payload;
};

//////////////////
// exports.registerUser = catchAsyncErrors(async(req,res,next) => {

// })
