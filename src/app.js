import express from "express";
import { userRouter } from "./routes/user.routes.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from 'cookie-parser';
import "./config/googleStrategy.js"
import { employeeRouter } from "./routes/employee.routes.js";
import session from "express-session";
import MongoDBStore from "connect-mongodb-session";

const server = express();
const MongoStore = MongoDBStore(session);

const store = new MongoStore({
  uri: process.env.DATABASE_URL,
  collection: "sessions",
});

server.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store,
    cookie: {
      httpOnly: true,
      secure: true, // set false in local dev if not using https
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);


// Middlewares
server.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.header("Access-Control-Allow-Origin", origin);
  } else {
    res.header("Access-Control-Allow-Origin", "*");
  }
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.header("Access-Control-Allow-Credentials", "true");

  // ✅ Handle preflight requests immediately
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});
server.use(express.json({limit:"16kb"}));
server.use(express.urlencoded({extended:true , limit:"16kb"}));
// Static middleware
const __filename = fileURLToPath(import.meta.url);
const __dirname =  path.dirname(__filename);
// server.use(express.static(path.resolve(__dirname,"build")));
server.use(cookieParser());

server.use("/user" , userRouter);
server.use("/employee" , employeeRouter);



export {server};