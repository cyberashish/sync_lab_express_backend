import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import { prisma } from "../utils/client.js";
import bcrypt from "bcryptjs";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_HOST}/user/api/auth/callback/google`,
    },
    async function (_accessToken, _refreshToken, profile, done) {
      try {
        // Find existing user
        let user = await prisma.user.findUnique({
          where: { email: profile._json.email },
        });

        // If user doesn't exist, create one
        if (!user) {
          const lastSixDigitId = profile.id.slice(-6);
          const lastTwoCharacter = profile._json.name.slice(-2);
          const newPass = lastTwoCharacter + lastSixDigitId;

          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(newPass, salt);

          user = await prisma.user.create({
            data: {
              email: profile._json.email,
              fullname: profile._json.name,
              password: hashedPassword,
              image: profile._json.picture,
              googleId: profile.id,
            },
          });
        }

        // ✅ Passport handles the session for you
        // The user object here will be serialized into the session
        return done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);
