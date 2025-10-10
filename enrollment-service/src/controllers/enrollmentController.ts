import { Request, Response } from "express";
import { enrollmentService } from "../services/enrollmentService";

const completeLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lessonId } = req.params;
    if (!req.userId) {
      res.status(401).json({ error: "Ошибка аутентификации" });
      return;
    }

    const { courseId } = req.body;
    
    if (!courseId) {
      res.status(400).json({ error: "Нужен id курса" });
      return;
    }

    const enrollment = await enrollmentService.completeLesson(req.userId, lessonId, courseId);
    res.status(200).json({ enrollment });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const uncompleteLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lessonId } = req.params;
    if (!req.userId) {
      res.status(401).json({ error: "Ошибка аутентификации" });
      return;
    }

    const { courseId } = req.body;
    
    if (!courseId) {
      res.status(400).json({ error: "Нужен id курса" });
      return;
    }

    const enrollment = await enrollmentService.uncompleteLesson(req.userId, lessonId, courseId);
    res.status(200).json({ enrollment });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const getCourseEnrollmentsCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const count = await enrollmentService.getCourseEnrollmentsCount(courseId);
    res.status(200).json({ count });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const getUserProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    if (!req.userId) {
      res.status(401).json({ error: "Ошибка аутентификации" });
      return;
    }
    const progress = await enrollmentService.getUserProgress(req.userId, courseId);
    res.status(200).json(progress);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const enroll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    if (!req.userId) {
      res.status(401).json({ error: "Ошибка аутентификации" });
      return;
    }
    const enrollment = await enrollmentService.enrollUser(courseId, req.userId);
    res.status(201).json({ enrollment });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const enrollmentController = {
  enroll,
  completeLesson,
  uncompleteLesson,
  getCourseEnrollmentsCount,
  getUserProgress,
};