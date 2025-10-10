import { Request, Response } from "express";
import { courseService } from "../services/courseService";
import { downloadAndProcessImage } from "../services/imageDownloadService";
import { Types } from "mongoose";

const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, price, category, level, published, tags, imageUrl } = req.body;
    
    if (!req.userId) {
      res.status(401).json({ error: "Ошибка аутентификации" });
      return;
    }

    let imagePath = "default-course-image.jpg";

    if (imageUrl) {
      try {
        imagePath = await downloadAndProcessImage(imageUrl);
      } catch (error) {
        console.error("Не удалось загрузить изображение:", error);
        res.status(400).json({ error: "Не удалось загрузить изображение" + (error as Error).message });
        return;
      }
    }

    let parsedTags = [];
    if (tags) {
      if (typeof tags === 'string') {
        try {
          parsedTags = JSON.parse(tags);
        } catch (e) {
          parsedTags = tags.split(',').map((tag: string) => tag.trim());
        }
      } else if (Array.isArray(tags)) {
        parsedTags = tags;
      }
    }

    const course = await courseService.createCourse({
      title,
      description,
      price: Number(price),
      image: imagePath,
      category,
      level: level || "beginner",
      published: published === "true",
      author: new Types.ObjectId(req.userId),
      tags: parsedTags
    });

    res.status(201).json({ course });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = "1",
      limit = "10",
      sort,
      category,
      level,
      published,
      minPrice,
      maxPrice,
      tags,
      search,
    } = req.query;

    const filters = {
      ...(category && { category: category as string }),
      ...(level && { level: level as string }),
      ...(published !== undefined && { published: published === "true" }),
      ...(minPrice && { minPrice: Number(minPrice) }),
      ...(maxPrice && { maxPrice: Number(maxPrice) }),
      ...(tags && { tags: (tags as string).split(",") }),
      ...(search && { search: search as string }),
    };

    const options = {
      page: Number(page),
      limit: Number(limit),
      ...(sort && { sort: sort as string }),
    };

    const result = await courseService.getCourses(filters, options);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const course = await courseService.getCourseById(id);
    
    if (!course) {
      res.status(404).json({ error: "Курс не найден" });
      return;
    }

    res.status(200).json({ course });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.imageUrl) {
      try {
        const processedImagePath = await downloadAndProcessImage(updateData.imageUrl);
        updateData.image = processedImagePath;
        delete updateData.imageUrl;
      } catch (error) {
        console.error("Не удалось загрузить изображение:", error);
        res.status(400).json({ error: "Не удалось загрузить изображение: " + (error as Error).message });
        return;
      }
    }

    if (updateData.tags) {
      updateData.tags = JSON.parse(updateData.tags);
    }

    const course = await courseService.updateCourse(id, updateData);
    
    if (!course) {
      res.status(404).json({ error: "Курс не найден" });
      return;
    }

    res.status(200).json({ course });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const del = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const course = await courseService.deleteCourse(id);
    
    if (!course) {
      res.status(404).json({ error: "Курс не найден" });
      return;
    }

    res.status(200).json({ message: "Курс удален" });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const addToFavorites = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    
    if (!req.userId) {
      res.status(401).json({ error: "Пользователь не найден" });
      return;
    }

    const course = await courseService.addToFavorites(courseId, req.userId);
    res.status(200).json({ message: "Курс добавлен в избранное", course });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const removeFromFavorites = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    
    if (!req.userId) {
      res.status(401).json({ error: "Пользователь не найден" });
      return;
    }

    const course = await courseService.removeFromFavorites(courseId, req.userId);
    res.status(200).json({ message: "Курс удален из избранного", course });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const getFavorites = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = "1", limit = "10" } = req.query;
    
    if (!req.userId) {
      res.status(401).json({ error: "Пользователь не найден" });
      return;
    }

    const result = await courseService.getFavoriteCourses(req.userId, {
      page: Number(page),
      limit: Number(limit),
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const courseController = {
  create,
  getAll,
  getById,
  update,
  delete: del, //для экспорта
  addToFavorites,
  removeFromFavorites,
  getFavorites,
};