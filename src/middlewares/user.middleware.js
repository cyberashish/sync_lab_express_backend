import jwt from "jsonwebtoken";
import { generateJwtToken } from "../controllers/user.controller.js";
import { ApiError } from "../utils/ApiError.js";

export function verifyToken(token , secretKey){
  return new Promise((resolve , reject) => {
   jwt.verify(token , secretKey , function(error , decoded){
       if(error){
           reject(error)
       }else{
           resolve(decoded);
       }
   })
  })
}

export async function verifyJwToken(req,res,next){
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  if(accessToken && refreshToken){
  const accessTokenDecodedInfo = await verifyToken(accessToken , process.env.ACCESS_TOKEN_SECRET_KEY);
  if(accessTokenDecodedInfo){
    next();
  }else{
   const refreshTokenDecodedInfo = await verifyToken(refreshToken , process.env.REFRESH_TOKEN_SECRET_KEY);
   if(refreshTokenDecodedInfo){
    const accessToken = await generateJwtToken({fullname : refreshTokenDecodedInfo.fullname , email: refreshTokenDecodedInfo.email}, process.env.ACCESS_TOKEN_SECRET_KEY , 1);
    res.cookie("accessToken" , accessToken , {
       httpOnly: true ,
       secure: true ,
       sameSite:'none',
       path: "/",
    });
    next();
   }else{
       res.status(401).json(new ApiError(401,"Jwt tokens expired!"))
   }
  }
}else{
   res.status(401).json(new ApiError(422 , "Must provide Jwt Token"));
}
}