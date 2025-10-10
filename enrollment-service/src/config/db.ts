import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const connectDB = async () => {
  try {
    console.log('Enrollment Service: Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Enrollment Service: MongoDB connected!');
  } catch (error) {
    console.error('Enrollment Service: MongoDB connection error: ', error);
    process.exit(1);
  }
};