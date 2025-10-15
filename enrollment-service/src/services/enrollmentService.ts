import { EnrollmentModel, IEnrollment } from "../models/enrollment";
import { Types } from "mongoose";
const { v4: uuidv4 } = require('uuid');
import { channel } from '../rabbitmq/consumer';

export const enrollmentService = {
  async enrollUser(courseId: string, userId: string) {
    const existingEnrollment = await EnrollmentModel.findOne({
      user: new Types.ObjectId(userId),
      course: new Types.ObjectId(courseId),
    });

    if (existingEnrollment) {
      throw new Error("Пользователь уже записан на этот курс");
    }

    const enrollment = new EnrollmentModel({
      user: new Types.ObjectId(userId),
      course: new Types.ObjectId(courseId),
      progress: 0,
      completedLessons: [],
    });

    await enrollment.save();
    return enrollment; 
  },

  async completeLesson(userId: string, lessonId: string, courseId: string) {
    let enrollment = await EnrollmentModel.findOne({
      user: new Types.ObjectId(userId),
      course: new Types.ObjectId(courseId),
    });

    if (!enrollment) throw new Error("Пользователь не записан на этот курс");

    const lessonIdObject = new Types.ObjectId(lessonId);
    
    if (!enrollment.completedLessons.includes(lessonIdObject)) {
      enrollment.completedLessons.push(lessonIdObject);
      await this.calculateProgress(enrollment, courseId);
      await enrollment.save();
    }

    return enrollment;
  },

  async uncompleteLesson(userId: string, lessonId: string, courseId: string) {
    let enrollment = await EnrollmentModel.findOne({
      user: new Types.ObjectId(userId),
      course: new Types.ObjectId(courseId),
    });

    if (!enrollment) throw new Error("Пользователь не записан на этот курс");

    const lessonIdObject = new Types.ObjectId(lessonId);
    enrollment.completedLessons = enrollment.completedLessons.filter(
      (completedLessonId) => !completedLessonId.equals(lessonIdObject)
    );

    await this.calculateProgress(enrollment, courseId);
    await enrollment.save();
    return enrollment;
  },

  async calculateProgress(enrollment: IEnrollment, courseId: string) {
    try {
      const totalLessons = await this.getTotalLessonsForCourse(courseId);
      console.log(`Course ${courseId} has ${totalLessons} lessons`);

      const completedCount = enrollment.completedLessons.length;
      
      if (totalLessons === 0) {
        enrollment.progress = 0;
      } else {
        enrollment.progress = Math.round((completedCount / totalLessons) * 100);
      }
      
      if (enrollment.progress > 100) {
        enrollment.progress = 100;
      }

      if (enrollment.progress === 100 && !enrollment.completed) {
        enrollment.completed = true;
        enrollment.completedAt = new Date();
      } else if (enrollment.progress < 100 && enrollment.completed) {
        enrollment.completed = false;
        enrollment.completedAt = undefined;
      }

      return enrollment.progress;
    } catch (error) {
      console.error('Error calculating progress:', error);
      enrollment.progress = enrollment.completedLessons.length;
      return enrollment.progress;
    }
  },

  async getCourseEnrollmentsCount(courseId: string) {
    return await EnrollmentModel.countDocuments({
      course: new Types.ObjectId(courseId),
    });
  },

  async getUserProgress(userId: string, courseId: string) {
    const enrollment = await EnrollmentModel.findOne({
      user: new Types.ObjectId(userId),
      course: new Types.ObjectId(courseId),
    });

    if (!enrollment) {
      throw new Error("Пользователь не записан на этот курс");
    }

    try {
      const totalLessons = await this.getTotalLessonsForCourse(courseId);
      return {
        progress: enrollment.progress,
        completedLessons: enrollment.completedLessons.length,
        totalLessons,
        completed: enrollment.completed,
      };
    } catch (error) {
      console.error('Error getting total lessons:', error);
      return {
        progress: enrollment.progress,
        completedLessons: enrollment.completedLessons.length,
        totalLessons: 0,
        completed: enrollment.completed,
      };
    }
  },

  async getTotalLessonsForCourse(courseId: string): Promise<number> {
    return new Promise(async (resolve, reject) => {
      if (!channel) {
        reject(new Error('RabbitMQ channel is not available'));
        return;
      }

      const correlationId = uuidv4();
      const responseQueue = await channel.assertQueue('', { exclusive: true, autoDelete: true });

      const timeout = setTimeout(() => {
        if (channel) {
          channel.deleteQueue(responseQueue.queue);
        }
        reject(new Error('Timeout waiting for lessons count response'));
      }, 5000);

      channel.consume(responseQueue.queue, (msg: any) => {
        if (msg && msg.properties.correlationId === correlationId) {
          clearTimeout(timeout);
          
          try {
            const response = JSON.parse(msg.content.toString());
            
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response.lessonsCount);
            }
          } catch (error) {
            reject(new Error('Invalid response format'));
          } finally {
            if (channel) {
              channel.deleteQueue(responseQueue.queue);
              channel.ack(msg);
            }
          }
        }
      }, { noAck: false });

      const request = {
        courseId,
        correlationId,
        replyTo: responseQueue.queue
      };

      const sent = channel.sendToQueue(
        'lessons_count_queue',
        Buffer.from(JSON.stringify(request)),
        { 
          persistent: true,
          correlationId,
          replyTo: responseQueue.queue
        }
      );

      if (!sent) {
        clearTimeout(timeout);
        if (channel) {
          channel.deleteQueue(responseQueue.queue);
        }
        reject(new Error('Failed to send lessons count request'));
      }
    });
  }
};