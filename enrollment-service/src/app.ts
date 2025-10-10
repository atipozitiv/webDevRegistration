import express from 'express';
import { connectDB } from './config/db';
import { enrollmentRoutes } from './routes/enrollmentRoutes';
import { connectRabbitMQ } from './rabbitmq/consumer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const app = express();
const PORT = process.env.ENROLLMENT_SERVICE_PORT || 3003;

app.use(express.json());

connectDB();
connectRabbitMQ().catch(error => {
  console.error('Failed to connect to RabbitMQ:', error);
});

app.use('/', enrollmentRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'Enrollment Service is running', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`Enrollment Service running on http://localhost:${PORT}`);
});