const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

passport.use(
  new GoogleStrategy(
    {
      clientID:
        "844933960444-ngm9nm4sv1kvprrmm2s11e0ul2nbmcih.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "/auth/google/redirect",
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        const existingUser = await User.findOne({ googleId: profile.id });
        if (existingUser) {
          return done(null, existingUser);
        }
        const newUser = new User({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          avatar: {
            public_id: "Google Profile picture",
            url: profile.photos[0].value,
          },
        });
        await newUser.save();
        const token = jwt.sign({ id: newUser._id }, secret, {
          expiresIn: "1d",
        });
        done(null, newUser, token);
      } catch (err) {
        done(err, null);
      }
      // done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// passport.serializeUser((user, done) => {
//   done(null, user);
// });

// passport.deserializeUser((user, done) => {
//   done(null, user);
// });
