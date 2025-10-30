
import bcrypt, { genSalt } from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/client.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { verifyToken } from "../middlewares/user.middleware.js";
import { sendEmail } from "../utils/sendEmail.js";


export  function generateJwtToken(user , secretKey , expiry){
     return new Promise((resolve , reject) => {
         jwt.sign(user, secretKey , {expiresIn:`${expiry}d`}, function( error , token){
           if(error){
            reject(error)
           }else{
            resolve(token)
           }
         })
     })
 }


 export const RegisterUser = async (req, res) => {
  const { email, fullname, password } = req.body;

  if (!email || !fullname || !password)
    return res.status(422).json(new ApiError(422, "Missing Required Fields"));

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(409).json(new ApiError(409, "User already registered"));

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const createdUser = await prisma.user.create({
      data: { email, fullname, password: hashedPassword },
    });

    // ✅ Create session after successful registration
    req.session.user = {
      id: createdUser.id,
      email: createdUser.email,
      fullname: createdUser.fullname,
    };

    res
      .status(201)
      .json(new ApiResponse(201, createdUser, "User registered successfully"));
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
};



export const LoginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(422).json(new ApiError(422, "Missing fields"));

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json(new ApiError(404, "User not found"));

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json(new ApiError(401, "Invalid credentials"));

    // ✅ Store minimal user info in session
    req.session.user = {
      id: user.id,
      email: user.email,
      fullname: user.fullname,
    };

    res
      .status(200)
      .json(new ApiResponse(200, user, "User logged in successfully"));
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
};


export const LogoutUser = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err)
        return res
          .status(500)
          .json(new ApiError(500, "Failed to destroy session"));

      res.clearCookie("connect.sid", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });
      res
        .status(200)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
    });
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
};

export const getAuthenticatedUser = async (req, res) => {
  try {
    // Check if session exists and user data is stored
    if (!req.session || !req.session.user) {
      return res
        .status(401)
        .json(new ApiError(401, "No active session. Please log in."));
    }

    const sessionUser = req.session.user;

    // Fetch the most up-to-date user data from DB (optional but recommended)
    const user = await prisma.user.findUnique({
      where: { email: sessionUser.email },
    });

    if (!user) {
      return res
        .status(404)
        .json(new ApiError(404, "User not found in database"));
    }

    // Combine session info and DB info
    const userData = {
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return res
      .status(200)
      .json(new ApiResponse(200, userData, "Authenticated user fetched successfully"));
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
};


export const sendResetLink = async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({
    where:{
      email
    }
  })

  if (!user) return res.status(404).json({ message: "User not found" });

  const token = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET_KEY, {
    expiresIn: "15m",
  });

  const link = `${process.env.FRONTEND_HOST}/auth/reset-password/${token}`;

  try{
    await sendEmail(
      user.email,
      "Password Reset Request",
      `<p>Click the link below to reset your password:</p>
       <a href="${link}">${link}</a>
       <p>This link expires in 15 minutes.</p>`
    );
  }catch(error){
    console.error("MAIL ERROR:", error);
  }

  res.json({ message: "Password reset link sent to email." });
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
    const user = await prisma.user.findUnique({
      where:{
        id:decoded.id
      }
    })

    if (!user) return res.status(404).json({ message: "User not found" });

    const hashedPassword = bcrypt.hashSync(password, 10);
    await prisma.user.update({
      where:{
        id: user.id
      },
      data:{
        password: hashedPassword
      }
    })

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

export const updatePassword = async (req , res) => {
  const {email , password} = req.body;
  if(email && password){
     try{
       const user = await prisma.user.findUnique({
        where:{
          email
        }
       });
       const hashedPassword = bcrypt.hashSync(password , 10);
       const updatedUser = await prisma.user.update({
        where:{
          email
        },
        data:{
          password:hashedPassword
        }
       });
       res.status(200).json(new ApiResponse(200 , updatedUser , "Successfully updated user password!"));
     }catch(error){
      res.status(500).json(new ApiResponse(500 , "Internal server error"));
     }
  }else{
    res.status(422).json(new ApiResponse(422 , "All fields are required!"))
  }
}

export const getUserByEmail = async (req , res) => {
   const {email} = req.body;
   if(email){
      try {
         const user = await prisma.user.findUnique({
          where:{
            email
          }
         });
         res.status(200).json(new ApiResponse(200 , user , "Successfully fetched user!"));
      } catch (error) {
        res.status(500).json(new ApiResponse(500, "Internal server error!"));
      }
   }else{
    res.status(422).json(new ApiResponse(422 , "All fields are required"));
   }
}


export const sendLeaveRequestEmail = async (req, res) => {
  try {
    const { name, message, _subject } = req.body;

    if (!name || !message || !_subject) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden;">
          <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
            <h2>${_subject}</h2>
          </div>

          <div style="padding: 25px;">
            <p>Dear HR/Manager,</p>
            <p><strong>${name}</strong> has submitted a new leave request through the Wrappixel EMS system.</p>

            <table style="width:100%; border-collapse: collapse; margin-top: 20px;">
              <tr style="background-color: #f1f5f9;">
                <td style="padding: 12px; border: 1px solid #e2e8f0;"><strong>Employee Name</strong></td>
                <td style="padding: 12px; border: 1px solid #e2e8f0;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border: 1px solid #e2e8f0;"><strong>Message</strong></td>
                <td style="padding: 12px; border: 1px solid #e2e8f0;">${message}</td>
              </tr>
            </table>

            <p style="margin-top: 30px;">Please review this request and take the necessary action.</p>
            <p>Thank you,<br><strong>Wrappixel EMS</strong></p>
          </div>

          <div style="background-color: #f1f5f9; color: #64748b; text-align: center; padding: 15px; font-size: 13px;">
            © ${new Date().getFullYear()} Wrappixel EMS. All rights reserved.
          </div>
        </div>
      </div>
    `;

    await sendEmail({
      to: "cybermadhav0@gmail.com",
      subject: _subject,
      html,
    });

    res.status(200).json({ message: "Leave request email sent successfully!" });
  } catch (error) {
    console.error("Email sending error:", error);
    res.status(500).json({ message: "Failed to send email." });
  }
};


