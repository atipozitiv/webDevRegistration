import { CommentModel, IComment } from "../models/comment";
import { LessonModel } from "../models/lesson";
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
    const lesson = await LessonModel.findById(commentData.lesson);

    if (!lesson) {
      throw new Error("Урок не найден");
    }

    const comment = new CommentModel({
      ...commentData,
      user: new Types.ObjectId(commentData.user),
      lesson: new Types.ObjectId(commentData.lesson),
    });

    await comment.save();
    
    return await comment.populate("lesson", "title");
  },

  async getCommentsByLesson(lessonId: string) {
    return await CommentModel.find({ lesson: new Types.ObjectId(lessonId) })
      .populate("lesson", "title")
      .sort({ createdAt: -1 });
  },

  async getCommentById(id: string) {
    return await CommentModel.findById(id).populate("lesson", "title");
  },

  async updateComment(id: string, updateData: UpdateCommentData) {
    return await CommentModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("lesson", "title");
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