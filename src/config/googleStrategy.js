import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import { prisma } from "../utils/client.js";
import { generateJwtToken } from "../controllers/user.controller.js";
import bcrypt from "bcryptjs";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_HOST}/api/auth/callback/google`,
    },
    async function (_accessToken, _refreshToken, profile, cb) {

      try {
        let user = await prisma.user.findUnique({
          where: {
            email: profile._json.email,
          },
        });
        if(!user){
          const lastSixDigitId = profile.id.substring(profile.id.length - 6);
          const lastTwoCharacter = profile._json.name.substring(profile._json.name.length - 2);
          const newPass = lastTwoCharacter + lastSixDigitId;

          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(newPass,salt)

            await prisma.user.create({
                data:{
                    email:profile?._json?.email,
                    fullname:profile?._json?.name,
                    password:hashedPassword,
                    image:profile?._json?.picture,
                    googleId:profile?.id
                }
            })
        }
        const accessToken = await generateJwtToken(
            { fullname: user?.fullname, email: user?.email , image: user?.image },
            process.env.ACCESS_TOKEN_SECRET_KEY,
            1
          );
          const refreshToken = await generateJwtToken(
            { fullname: user?.fullname, email: user?.email , image: user?.image },
            process.env.REFRESH_TOKEN_SECRET_KEY,
            7
          );
          const allInfo = profile?._json;
          return cb(null , {user , accessToken , allInfo, refreshToken})
      } catch (error) {
        cb(error);
      }
    }
  )
);
