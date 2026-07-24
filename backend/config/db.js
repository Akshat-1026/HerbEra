import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 100,
      minPoolSize: 20,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 10000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host} (pool: 100)`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

export default connectDB;