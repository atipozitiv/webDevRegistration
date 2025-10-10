import amqp from 'amqplib';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

let channel: amqp.Channel | null = null;

export async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL!);
    channel = await connection.createChannel();
    await channel.assertQueue('enrollment_queue', { durable: true });
    console.log('Courses Service: Connected to RabbitMQ');
  } catch (error) {
    console.error('Courses Service: RabbitMQ connection error:', error);
    throw error;
  }
}

export async function publishEnrollmentMessage(courseId: string, userId: string) {
  if (!channel) {
    throw new Error('RabbitMQ channel is not available.');
  }

  const message = {
    courseId,
    userId,
    timestamp: new Date().toISOString(),
  };

  const sent = channel.sendToQueue(
    'enrollment_queue',
    Buffer.from(JSON.stringify(message)),
    { persistent: true }
  );

  if (sent) {
    console.log(`Enrollment message sent for user ${userId} to course ${courseId}`);
  } else {
    console.error('Failed to send enrollment message');
  }
  return sent;
}