import mongoose from "mongoose";

 const connectDB = async () => {
    
  if (!process.env.MONGO_URI) {
    console.error("Error: MONGO_URI is not defined in .env file");
    process.exit(1);
   }

  try {
   const con = await mongoose.connect(process.env.MONGO_URI)
   console.log(`Database connected to ${con.connection.host}`);
   
  } catch (error) {
    console.log(`Error: ${error.message}`);
    process.exit(1);
  }
 }
 export default connectDB