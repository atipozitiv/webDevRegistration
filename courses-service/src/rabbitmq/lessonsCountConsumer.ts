import { LessonModel } from "../models/lesson";
import { Types } from "mongoose";

export async function setupLessonsCountConsumer(channel: any) {
  if (!channel) {
    console.error('Channel is not available for lessons count consumer');
    return;
  }

  console.log('Setting up lessons count consumer...');

  channel.consume('lessons_count_queue', async (msg: any) => {
    if (msg) {
      try {
        const message = JSON.parse(msg.content.toString());
        console.log('Received lessons count request:', message);

        const { courseId, correlationId, replyTo } = message;

        const lessonsCount = await LessonModel.countDocuments({ 
          course: new Types.ObjectId(courseId) 
        });

        console.log(`Found ${lessonsCount} lessons for course ${courseId}`);

        const response = {
          courseId,
          lessonsCount,
          correlationId
        };

        channel.sendToQueue(
          replyTo,
          Buffer.from(JSON.stringify(response)),
          { 
            persistent: true,
            correlationId: correlationId
          }
        );

        channel.ack(msg);
        console.log(`Sent lessons count response for course ${courseId}: ${lessonsCount}`);

      } catch (error) {
        console.error('Error processing lessons count request:', error);

        if (msg.properties.replyTo) {
          const errorResponse = {
            error: "Failed to get lessons count",
            correlationId: msg.properties.correlationId
          };
          
          channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify(errorResponse)),
            { 
              persistent: true,
              correlationId: msg.properties.correlationId
            }
          );
        }
        
        channel.ack(msg);
      }
    }
  }, { noAck: false });

  console.log('Lessons count consumer is ready');
}