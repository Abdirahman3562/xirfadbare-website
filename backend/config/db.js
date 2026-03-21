import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/samafale_academy');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    if (error.message.includes('ENOTFOUND')) {
      console.error('Diagnostic Help: This is a DNS resolution error. Please check your internet connection or try a non-SRV connection string.');
    }
    process.exit(1);
  }
};

export default connectDB;





