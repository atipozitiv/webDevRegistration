import express from 'express';
import { connectDB } from './config/db';
import { authRoutes } from './routes/authRoutes';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const app = express();
const PORT = process.env.AUTH_SERVICE_PORT || 3001;

app.use(express.json());
connectDB();
app.use('/', authRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'Auth Service is running', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`Auth Service running on http://localhost:${PORT}`);
});