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
  
.get('/api/auth/callback/google', 
    passport.authenticate('google', {session: false, failureRedirect: `${process.env.FRONTEND_HOST}/auth/login` }),
   async (req,res) => {
        let userData = req.user;
        console.log(userData)
      if (!userData.allInfo.email) {
        return res.redirect(`${process.env.FRONTEND_HOST}/auth/login?error=no_email`);
      }

const accessToken = jwt.sign(
    { fullname:userData.allInfo.name , email: userData.allInfo.email },
    process.env.ACCESS_TOKEN_SECRET_KEY,
    { expiresIn: "1d" } 
  );

  const refreshToken = jwt.sign(
    { fullname:userData.allInfo.name , email: userData.allInfo.email },
    process.env.REFRESH_TOKEN_SECRET_KEY,
    { expiresIn: "7d" } 
  );

        res.cookie("accessToken" , accessToken , {
            httpOnly: false,
            secure:true, sameSite:'none',path: "/",
        });
        res.cookie("refreshToken" , refreshToken , {
            httpOnly: false,
            secure:true, sameSite:'none',path: "/",
        });
        res.redirect(`${process.env.FRONTEND_HOST}/dashboard`);
    }
    )
.get('/token/get-user' , getAuthenticatedUser)
.post("/forgot-password", sendResetLink)
.post("/reset-password/:token", resetPassword)
.post("/get-user/email", getUserByEmail)
.put("/user/update-password" , updatePassword)
.post("/user/leave-request-email" , sendLeaveRequestEmail)
// .post("/add-employee" , addEmployee)
    



export {userRouter}