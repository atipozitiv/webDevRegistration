import express from 'express';
import { connectDB } from './config/db';
import { lessonRoutes } from './routes/lessonRoutes';
import { courseRoutes } from './routes/courseRoutes';
import { commentRoutes } from './routes/commentRoutes';
import { connectRabbitMQ } from './rabbitmq/producer';
import { setupLessonsCountConsumer } from './rabbitmq/lessonsCountConsumer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const app = express();
const PORT = process.env.COURSES_SERVICE_PORT || 3002;

app.use(express.json());

connectDB();

connectRabbitMQ().then(async (channel) => {
  if (channel) {
    await channel.assertQueue('lessons_count_queue', { durable: true });
    console.log('Courses Service: Lessons count queue setup complete');
    
    await setupLessonsCountConsumer(channel);
  }
}).catch(error => {
  console.error('Failed to connect to RabbitMQ:', error);
});

app.get('/health', (req, res) => {
  res.json({ status: 'Courses Service is running', timestamp: new Date() });
});

app.use('/lessons', lessonRoutes);
app.use('/', courseRoutes);
app.use('/', commentRoutes);

app.listen(PORT, () => {
  console.log(`Courses Service running on http://localhost:3002`);
});