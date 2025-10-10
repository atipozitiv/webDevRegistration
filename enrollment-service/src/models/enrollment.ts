import { model, Schema, Types } from "mongoose";

export interface IEnrollment {
  user: Types.ObjectId;
  course: Types.ObjectId;
  enrolledAt: Date;
  completed: boolean;
  completedAt?: Date;
  progress: number;
  completedLessons: Types.ObjectId[];
}

const enrollmentSchema = new Schema<IEnrollment>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  enrolledAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  completedLessons: [{
    type: Schema.Types.ObjectId,
    ref: "Lesson",
  }],
});

enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ course: 1 });

export const EnrollmentModel = model<IEnrollment>("Enrollment", enrollmentSchema);