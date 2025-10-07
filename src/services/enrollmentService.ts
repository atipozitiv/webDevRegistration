import { EnrollmentModel, IEnrollment } from "../models/enrollment";
import { CourseModel } from "../models/course";
import { UserModel } from "../models/user";
import { LessonModel } from "../models/lesson";
import { Types } from "mongoose";

export const enrollmentService = {
  async enrollUser(courseId: string, userId: string) {
    const course = await CourseModel.findById(courseId);
    if (!course) throw new Error("Курс не найден");

    const user = await UserModel.findById(userId);
    if (!user) throw new Error("Пользователь не найден");

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
    
    await UserModel.findByIdAndUpdate(userId, {
      $push: { enrollments: enrollment._id },
    });

    return await enrollment.populate("course");
  },

  async completeLesson(userId: string, lessonId: string) {
    const lesson = await LessonModel.findById(lessonId);
    if (!lesson) throw new Error("Урок не найден");

    let enrollment = await EnrollmentModel.findOne({
      user: new Types.ObjectId(userId),
      course: lesson.course,
    });

    if (!enrollment) throw new Error("Пользователь не записан на этот курс");

    if (!enrollment.completedLessons.includes(new Types.ObjectId(lessonId))) {
      enrollment.completedLessons.push(new Types.ObjectId(lessonId));
      await this.calculateProgress(enrollment);
      await enrollment.save();
    }

    return enrollment;
  },

  async uncompleteLesson(userId: string, lessonId: string) {
    const lesson = await LessonModel.findById(lessonId);
    if (!lesson) throw new Error("Урок не найден");

    let enrollment = await EnrollmentModel.findOne({
      user: new Types.ObjectId(userId),
      course: lesson.course,
    });

    if (!enrollment) throw new Error("Пользователь не записан на этот курс");

    enrollment.completedLessons = enrollment.completedLessons.filter(
      (completedLessonId) => !completedLessonId.equals(new Types.ObjectId(lessonId))
    );

    await this.calculateProgress(enrollment);
    await enrollment.save();
    return enrollment;
  },

  async calculateProgress(enrollment: IEnrollment) {
    const totalLessons = await LessonModel.countDocuments({
      course: enrollment.course,
    });

    if (totalLessons === 0) {
      enrollment.progress = 0;
    } else {
      const completedCount = enrollment.completedLessons.length;
      enrollment.progress = Math.round((completedCount / totalLessons) * 100);
    }

    if (enrollment.progress === 100 && !enrollment.completed) {
      enrollment.completed = true;
      enrollment.completedAt = new Date();
    } else if (enrollment.progress < 100 && enrollment.completed) {
      enrollment.completed = false;
      enrollment.completedAt = undefined;
    }

    return enrollment.progress;
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

    const totalLessons = await LessonModel.countDocuments({
      course: new Types.ObjectId(courseId),
    });

    return {
      progress: enrollment.progress,
      completedLessons: enrollment.completedLessons.length,
      totalLessons,
      completed: enrollment.completed,
    };
  },
};