import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Try connecting with more explicit options
    const mongoURI =
      process.env.MONGODB_URI ;

    console.log("Attempting to connect to MongoDB...");

    const conn = await mongoose.connect(mongoURI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error(
      "Please check your MongoDB credentials and connection string",
    );
    process.exit(1);
  }
};

export default connectDB;
