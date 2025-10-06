import { LessonModel, ILesson } from "../models/lesson";
import { CourseModel } from "../models/course";
import { Types } from "mongoose";

interface CreateLessonData {
  title: string;
  content?: string;
  videoUrl?: string;
  course: string;
  order?: number;
}

interface UpdateLessonData {
  title?: string;
  content?: string;
  videoUrl?: string;
  order?: number;
}

export const lessonService = {
  async createLesson(lessonData: CreateLessonData) {
    const course = await CourseModel.findById(lessonData.course);
    if (!course) {
      throw new Error("Курс не найден");
    }

    const lesson = new LessonModel({
      ...lessonData,
      course: new Types.ObjectId(lessonData.course),
    });

    await lesson.save();
    return await lesson.populate("course", "title");
  },

  async getLessonsByCourse(courseId: string) {
    return await LessonModel.find({ course: new Types.ObjectId(courseId) })
      .populate("course", "title")
      .sort({ order: 1, createdAt: 1 });
  },

  async getLessonById(id: string) {
    return await LessonModel.findById(id).populate("course", "title");
  },

  async updateLesson(id: string, updateData: UpdateLessonData) {
    return await LessonModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("course", "title");
  },

  async deleteLesson(id: string) {
    const { commentService } = require("./commentService");
    await commentService.deleteCommentsByLesson(id);
  
    return await LessonModel.findByIdAndDelete(id);
  },

  async deleteLessonsByCourse(courseId: string) {
    const lessons = await LessonModel.find({ course: new Types.ObjectId(courseId) });
    const { commentService } = require("./commentService");
    for (const lesson of lessons) {
      await commentService.deleteCommentsByLesson(lesson._id.toString());
    }
    
    return await LessonModel.deleteMany({ course: new Types.ObjectId(courseId) });
  },
};