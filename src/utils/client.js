import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function connectDB(){
  try{
     await prisma.$connect();
     console.log("Databse connnected successfully");
  }catch(error){
   throw new Error(error)
  }
}

export {prisma , connectDB}