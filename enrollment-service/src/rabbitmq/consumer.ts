import amqp from 'amqplib';
import dotenv from 'dotenv';
import path from 'path';
import { enrollmentService } from '../services/enrollmentService';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

let channel: amqp.Channel | null = null;

export async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL!);
    channel = await connection.createChannel();
    
    const queueName = 'enrollment_queue';
    await channel.assertQueue(queueName, { durable: true });
    
    channel.prefetch(1);
    
    console.log('Enrollment Service: Connected to RabbitMQ');
    
    consumeMessages();
    
  } catch (error) {
    console.error('Enrollment Service: RabbitMQ connection error:', error);
    throw error;
  }
}

function consumeMessages() {
  if (!channel) return;

  channel.consume('enrollment_queue', async (msg) => {
    if (msg) {
      try {
        const message = JSON.parse(msg.content.toString());
        console.log('Received enrollment message:', message);

        const { courseId, userId } = message;

        await enrollmentService.enrollUser(courseId, userId);

        channel!.ack(msg);
        console.log(`Enrollment processed for user ${userId} to course ${courseId}`);

      } catch (error) {
        console.error('Error processing enrollment message:', error);
        channel!.nack(msg, false, false);
      }
    }
  }, { noAck: false });
}