import { CallbackError, Int32, model, Model, Schema, SchemaType, SchemaTypes } from "mongoose";
import bcrypt from "bcrypt";
import slugify from 'slugify';


interface ICourse {
  title: string;
  slug: string;
  description: string;
  price: number;
  image: {data:Storage, contentType: String};
  category: string;
  level: string;
  published: boolean;
  author: {type: Schema.Types.ObjectId, ref: 'UserModel'};
  createdAt: Date 
}

type CourseModel = Model<ICourse, object>;

const courseSchema = new Schema<ICourse, CourseModel>({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: false
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: {data:Storage, contentType: String},
    required: true
  },
  category: {
    type: String,
    required: true
  },
  level: {
    type: String,
    default: "beginner"
  },
  published: {
    type: Boolean,
    default: false
  },
  author: {
    type: {type: Schema.Types.ObjectId, ref: 'UserModel'},
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

courseSchema.pre('validate', function(next) {
  if(this.title) {
      this.slug = slugify(this.title, { lower: true,
      strict: true})
  }
  next()
})

export const CourseModel = model<ICourse, CourseModel>("Course", courseSchema);