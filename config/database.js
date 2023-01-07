import mongoose from "mongoose";

export const connectDatabase = async () =>{
   try{
      const {connections} = await mongoose.connect(process.env.MONGO_URI);
      console.log("MongoDB Connected")
   } catch(err){
      console.log("error connecting to MongoDB",err);
      process.exit(1);
   }
  
}