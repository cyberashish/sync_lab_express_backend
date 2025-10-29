
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


export const RegisterUser = async (req,res) => {
        const {email , fullname ,password} = req.body;
        if(email && fullname && password){
           try{
             const user = await prisma.user.findUnique({
                where:{
                    email:email
                }
             });
             if(!user){
               const salt = await bcrypt.genSalt(10);
               const hashedPassword = await bcrypt.hash(password , salt);
               try{ 
                  const createdUser = await prisma.user.create({
                    data:{
                        email,
                        fullname,
                        password:hashedPassword
                    }
                  });
                  if(createdUser){
                    try{
                        const accessToken = await generateJwtToken({fullname , email} , process.env.ACCESS_TOKEN_SECRET_KEY , 1);
                        const refreshToken = await generateJwtToken({fullname , email} , process.env.REFRESH_TOKEN_SECRET_KEY , 7);
                        res.cookie("accessToken" , accessToken , {
                            httpOnly: true ,
                            secure: true,
                        });
                        res.cookie('refreshToken' , refreshToken , {
                            httpOnly: true,
                            secure:false, sameSite:'strict'
                        })
                    }catch(error){
                       res.status(500).json(new ApiResponse(500 , error.message))
                    }
                    res.status(201).json(new ApiResponse(200 , createdUser , "User registered successfully"))
                  }else{
                    res.status(500).json(new ApiError(500 , "Failed to create user"))
                  }
               }catch(error){
                  res.status(500).json(new ApiError(500 , error.message))
               }
             }else{
                res.status(409).json(new ApiError(409 , "User already registered"));
             }

           }catch(error){
              res.status(500).json(new ApiError(500 , error.message))
           }
        }else{
            res.status(422).json(new ApiError(422 , "Missing Required Fields"))
        }
     
}


export const LoginUser = async (req,res) => {
      const {email , password} = req.body;
      if(email && password){
       try{
         const user = await prisma.user.findUnique({
            where:{
                email:email
            }
         });
         if(user){
           const isPasswordValid = await bcrypt.compare(password , user.password);
           if(isPasswordValid){
            try{
                const accessToken = await generateJwtToken({fullname:user.fullname , email:user.email} , process.env.ACCESS_TOKEN_SECRET_KEY , 1);
                const refreshToken = await generateJwtToken({fullname:user.fullname , email:user.email} , process.env.REFRESH_TOKEN_SECRET_KEY , 7);
                res.cookie("accessToken" , accessToken , {
                    httpOnly: true ,
                    secure: true,
                    sameSite: 'none'
                });
                res.cookie('refreshToken' , refreshToken , {
                    httpOnly: true,
                    secure:true,     sameSite: 'none'
                });
                res.status(200).json(new ApiResponse(200 , user, "User logged in successfully"))
            }catch(error){
               res.status(500).json(new ApiError(500 , "Failed to generate tokens"))
            }
           }else{
             res.status(404).json(new ApiError(404,"Email/Password not valid"))
           }
         }else{
             res.status(404).json(new ApiError(404 , "User not found"))
         }

       }catch(error){
         res.status(500).json(new ApiError(500 , error.message))
       }
      }else{
         res.status(422).json(new ApiError(422,"Please provide missing fields"));
      }
}

export const LogoutUser = async (req , res) => {
    try{
       res.clearCookie("accessToken" , {
        httpOnly: true ,
        secure: true,
        sameSite: 'none'
    });
       res.clearCookie("refreshToken" , {
        httpOnly: true ,
        secure: true,
        sameSite: 'none'
    });
       res.status(200).json(new ApiResponse(200,{},"User loggedout successfully!"));
    }catch(error){
        res.status(500).json(new ApiError(500 , error.message))
    }
}

export const getAuthenticatedUser = async (req , res) => {
     try{
      const accessToken = req.cookies.accessToken;
      console.log(accessToken,"andruni token")
      if(accessToken){
        const userData = await verifyToken(accessToken , process.env.ACCESS_TOKEN_SECRET_KEY);
        if(userData){
          const user = await prisma.user.findUnique({
            where:{
              email:userData.email
            }
          })
         res.status(200).json(new ApiResponse(200 , {...userData , ...user, role:user.role} , "Successfuly fetched authenticated user"));
        }else{
         res.status(401).json(new ApiError(401 , 'Invalid tokens/unauthorised access'));
        }
      }else{
        res.status(422).json(new ApiError(401 , 'Please provide valid token'));
      }
     }catch(error){
        res.status(401).json(new ApiError(401 , error.message))
     }
}

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


