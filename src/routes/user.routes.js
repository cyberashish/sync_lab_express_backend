import express from "express";
import { getAuthenticatedUser, getUserByEmail, LoginUser, LogoutUser, RegisterUser, resetPassword, sendLeaveRequestEmail, sendResetLink, updatePassword } from "../controllers/user.controller.js";
import passport from "passport";
import { verifyToken } from "../middlewares/user.middleware.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { employeeProfile, getEmployeeByEmail } from "../controllers/employee.controller.js";
import { prisma } from "../utils/client.js";
import jwt from "jsonwebtoken";

const userRouter = express.Router();

userRouter
.get("/data" , (req,res) => {
    res.json({type:"Get/new"})
})
.post("/register" , RegisterUser)
.post("/login" , LoginUser)
.get("/logout" , LogoutUser)

// Social Auth
.get('/auth/google',
    passport.authenticate('google', {session: false, scope: ['profile' , 'email'],prompt: "consent", }))
  
.get(
  "/api/auth/callback/google",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_HOST}/auth/login`,
  }),
  async (req, res) => {
    try {
      const user = req.user; // This comes from passport.deserializeUser

      if (!user?.email) {
        return res.redirect(
          `${process.env.FRONTEND_HOST}/auth/login?error=no_email`
        );
      }

      // ✅ Session is automatically created by express-session + passport
      // No JWT or cookie handling is needed here.

      // Redirect to your frontend dashboard (the session persists automatically)
      return res.redirect(`${process.env.FRONTEND_HOST}/dashboard`);
    } catch (error) {
      console.error("Google login error:", error);
      return res.redirect(
        `${process.env.FRONTEND_HOST}/auth/login?error=server_error`
      );
    }
  }
)
.get('/token/get-user' , getAuthenticatedUser)
.post("/forgot-password", sendResetLink)
.post("/reset-password/:token", resetPassword)
.post("/get-user/email", getUserByEmail)
.put("/update-password" , updatePassword)
.post("/leave-request-email" , sendLeaveRequestEmail)
.get("/api/me", async (req, res) => {
 	const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
	return res.json(session);
})
// .post("/add-employee" , addEmployee)
    



export {userRouter}