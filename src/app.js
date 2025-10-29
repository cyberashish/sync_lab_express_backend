import express from "express";
// import { userRouter } from "./routes/user.routes.ts";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from 'cookie-parser';
// import "./config/googleStrategy.ts"
// import { employeeRouter } from "./routes/employee.routes.ts";

const server = express();

// Middlewares
// server.use(cors({
//     origin: `${process.env.FRONTEND_HOST}`,  
//     credentials: true,  
// }));
server.use(express.json({limit:"16kb"}));
server.use(express.urlencoded({extended:true , limit:"16kb"}));
// Static middleware
const __filename = fileURLToPath(import.meta.url);
const __dirname =  path.dirname(__filename);
server.use(express.static(path.join(__dirname , "public")));
server.use(cookieParser());

// server.use("/" , userRouter);
// server.use("/employee" , employeeRouter);
server.get('/', (req, res) => {
    res.send('Hello, Express!');
  });

export {server};