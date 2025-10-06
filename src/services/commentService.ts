import { CommentModel, IComment } from "../models/comment";
import { LessonModel } from "../models/lesson";
import { UserModel } from "../models/user";
import { Types } from "mongoose";

interface CreateCommentData {
  user: string;
  lesson: string;
  text: string;
}

interface UpdateCommentData {
  text: string;
}

export const commentService = {
  async createComment(commentData: CreateCommentData) {
    const [lesson, user] = await Promise.all([
      LessonModel.findById(commentData.lesson),
      UserModel.findById(commentData.user),
    ]);

    if (!lesson) {
      throw new Error("Урок не найден");
    }
    if (!user) {
      throw new Error("Пользователь не найден");
    }

    const comment = new CommentModel({
      ...commentData,
      user: new Types.ObjectId(commentData.user),
      lesson: new Types.ObjectId(commentData.lesson),
    });

    await comment.save();
    return await comment.populate(["user", "lesson"]);
  },

  async getCommentsByLesson(lessonId: string) {
    return await CommentModel.find({ lesson: new Types.ObjectId(lessonId) })
      .populate("user", "username name surname")
      .populate("lesson", "title")
      .sort({ createdAt: -1 });
  },

  async getCommentById(id: string) {
    return await CommentModel.findById(id).populate(["user", "lesson"]);
  },

  async updateComment(id: string, updateData: UpdateCommentData) {
    return await CommentModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate(["user", "lesson"]);
  },

  async deleteComment(id: string) {
    return await CommentModel.findByIdAndDelete(id);
  },

  async deleteCommentsByLesson(lessonId: string) {
    return await CommentModel.deleteMany({ lesson: new Types.ObjectId(lessonId) });
  },

  async deleteCommentsByUser(userId: string) {
    return await CommentModel.deleteMany({ user: new Types.ObjectId(userId) });
  },

  async isCommentOwner(commentId: string, userId: string): Promise<boolean> {
    const comment = await CommentModel.findById(commentId);
    return comment ? comment.user.toString() === userId : false;
  },
};