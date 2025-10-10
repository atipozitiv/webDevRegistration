import { model, Schema } from "mongoose";

export interface ITag {
  name: string;
}

const tagSchema = new Schema<ITag>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  }
});

export const TagModel = model<ITag>("Tag", tagSchema);