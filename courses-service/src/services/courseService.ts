import { CourseModel, ICourse } from "../models/course";
import { TagModel } from "../models/tag";
import { Types } from "mongoose";

interface CourseFilters {
  category?: string;
  level?: string;
  published?: boolean;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  search?: string;
}

interface PaginationOptions {
  page: number;
  limit: number;
  sort?: string;
}

interface CreateCourseData {
  title: string;
  description?: string;
  price: number;
  image: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  published: boolean;
  author: Types.ObjectId;
  tags?: string[];
}

export const courseService = {
  async createCourse(courseData: CreateCourseData) {
    const slug = require("slugify")(courseData.title, { lower: true, strict: true });

    let tagIds: Types.ObjectId[] = [];
    if (courseData.tags && courseData.tags.length > 0) {
      for (const tagName of courseData.tags) {
        let tag = await TagModel.findOne({ name: tagName });
        if (!tag) {
          tag = new TagModel({ name: tagName });
          await tag.save();
        }
        tagIds.push(tag._id);
      }
    }

    const course = new CourseModel({
      ...courseData,
      slug,
      tags: tagIds,
      favorites: [],
    });

    await course.save();
    
    return await course.populate("tags");
  },

  async getCourses(filters: CourseFilters = {}, options: PaginationOptions = { page: 1, limit: 10 }) {
    const { page = 1, limit = 10, sort = "-createdAt" } = options;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (filters.category) query.category = filters.category;
    if (filters.level) query.level = filters.level;
    if (filters.published !== undefined) query.published = filters.published;
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
    }
    if (filters.tags && filters.tags.length > 0) {
      const tags = await TagModel.find({ name: { $in: filters.tags } });
      query.tags = { $in: tags.map(tag => tag._id) };
    }
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
      ];
    }

    const courses = await CourseModel.find(query)
      .populate("tags")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await CourseModel.countDocuments(query);

    return {
      courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  async getCourseById(id: string) {
    return await CourseModel.findById(id)
      .populate("tags");
  },

  async getCourseBySlug(slug: string) {
    return await CourseModel.findOne({ slug })
      .populate("tags");
  },

  async updateCourse(id: string, updateData: Partial<ICourse> & { tags?: string[] }) {
    if (updateData.tags) {
      let tagIds: Types.ObjectId[] = [];
      for (const tagName of updateData.tags) {
        let tag = await TagModel.findOne({ name: tagName });
        if (!tag) {
          tag = new TagModel({ name: tagName });
          await tag.save();
        }
        tagIds.push(tag._id);
      }
      updateData.tags = tagIds as any;
    }

    if (updateData.title) {
      updateData.slug = require("slugify")(updateData.title, { lower: true, strict: true });
    }

    return await CourseModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("tags");
  },

  async deleteCourse(id: string) {
    return await CourseModel.findByIdAndDelete(id);
  },

  async addToFavorites(courseId: string, userId: string) {
    const course = await CourseModel.findById(courseId);
    if (!course) {
      throw new Error("Курс не найден");
    }

    const userIdObject = new Types.ObjectId(userId);

    if (course.favorites.includes(userIdObject)) {
      throw new Error("Курс уже добавлен в избранное");
    }

    course.favorites.push(userIdObject);
    await course.save();

    return await course.populate("tags");
  },

  async removeFromFavorites(courseId: string, userId: string) {
    const course = await CourseModel.findById(courseId);
    if (!course) {
      throw new Error("Курс не найден");
    }

    const userIdObject = new Types.ObjectId(userId);
    course.favorites = course.favorites.filter(
      (favUserId) => !favUserId.equals(userIdObject)
    ) as Types.ObjectId[];

    await course.save();
    
    return await course.populate("tags");
  },

  async getFavoriteCourses(userId: string, options: any = { page: 1, limit: 10 }) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const courses = await CourseModel.find({ 
      favorites: new Types.ObjectId(userId) 
    })
      .populate("tags")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await CourseModel.countDocuments({ 
      favorites: new Types.ObjectId(userId) 
    });

    return {
      courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
};