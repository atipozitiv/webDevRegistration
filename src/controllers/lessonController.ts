import { Request, Response } from "express";
import { lessonService } from "../services/lessonService";

const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, videoUrl, course, order } = req.body;

    if (!title || !course) {
      res.status(400).json({ error: "Нет заголовка или курса" });
      return;
    }

    const lesson = await lessonService.createLesson({
      title,
      content,
      videoUrl,
      course,
      order: order ? Number(order) : undefined,
    });

    res.status(201).json({ lesson });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const getByCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const lessons = await lessonService.getLessonsByCourse(courseId);
    res.status(200).json({ lessons });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const lesson = await lessonService.getLessonById(id);

    if (!lesson) {
      res.status(404).json({ error: "Урок не найден" });
      return;
    }

    res.status(200).json({ lesson });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.order) {
      updateData.order = Number(updateData.order);
    }

    const lesson = await lessonService.updateLesson(id, updateData);

    if (!lesson) {
      res.status(404).json({ error: "Урок не найден" });
      return;
    }

    res.status(200).json({ lesson });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const del = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const lesson = await lessonService.deleteLesson(id);

    if (!lesson) {
      res.status(404).json({ error: "Урок не найден" });
      return;
    }

    res.status(200).json({ message: "Урок удален" });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const lessonController = {
  create,
  getByCourse,
  getById,
  update,
  delete: del,
};