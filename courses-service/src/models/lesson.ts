import { model, Schema, Types } from "mongoose";
//сделать счет order

export interface ILesson {
  title: string;
  content?: string;
  videoUrl?: string;
  course: Types.ObjectId;
  order?: number;
  createdAt: Date;
}

const lessonSchema = new Schema<ILesson>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    trim: true,
  },
  videoUrl: {
    type: String,
    trim: true,
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  order: {
    type: Number,
    default: 0,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

lessonSchema.index({ course: 1, order: 1 });

export const LessonModel = model<ILesson>("Lesson", lessonSchema);