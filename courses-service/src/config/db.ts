import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const connectDB = async () => {
  try {
    console.log('Courses Service: Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Courses Service: MongoDB connected!');
  } catch (error) {
    console.error('Courses Service: MongoDB connection error: ', error);
    process.exit(1);
  }
};