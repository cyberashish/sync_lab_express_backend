import express from "express";
import { userRouter } from "./routes/user.routes.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from 'cookie-parser';
import "./config/googleStrategy.js"
import { employeeRouter } from "./routes/employee.routes.js";

const server = express();

// Middlewares
server.use(cors({
    origin: process.env.FRONTEND_HOST || "http://localhost:5173",
    credentials: true,
  }));
server.use(express.json({limit:"16kb"}));
server.use(express.urlencoded({extended:true , limit:"16kb"}));
// Static middleware
const __filename = fileURLToPath(import.meta.url);
const __dirname =  path.dirname(__filename);
server.use(express.static(path.join(__dirname , "public")));
server.use(cookieParser());

server.use("/" , userRouter);
server.use("/employee" , employeeRouter);


export {server};