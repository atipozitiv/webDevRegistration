import { model, Schema, Types } from "mongoose";
import slugify from "slugify";

export interface ICourse {
  title: string;
  slug: string;
  description?: string;
  price: number;
  image: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  published: boolean;
  author: Types.ObjectId;
  tags: Types.ObjectId[];
  favorites: Types.ObjectId[];
  createdAt: Date;
}

const courseSchema = new Schema<ICourse>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    default: "beginner",
    required: true,
  },
  published: {
    type: Boolean,
    default: false,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  tags: [{
    type: Schema.Types.ObjectId,
    ref: "Tag",
  }],
  favorites: [{
    type: Schema.Types.ObjectId,
    ref: "User",
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

courseSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

export const CourseModel = model<ICourse>("Course", courseSchema);