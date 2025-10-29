import { server } from "./app.js";
import { connectDB } from "./utils/client.js";
import dotenv from "dotenv";

// import "./jobs/resetLeaves.ts";

dotenv.config({path:"./.env"});

const PORT = process.env.PORT || 8080;

connectDB().then(() => {
   server.on("error",() => {
    console.log("Failed to connect with the server");
   });
   server.listen(PORT,() => {
      console.log(`server started listening at http://localhost:${PORT}`)
   })
}).catch(() => {
    console.log("MongoDB connection failed");
})