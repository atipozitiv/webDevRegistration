import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('MONGO_URI:', process.env.MONGO_URI);
    
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined');
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Auth Service: MongoDB connected!');
  } catch (error) {
    console.error('Auth Service: MongoDB connection error: ', error);
    process.exit(1);
  }
};