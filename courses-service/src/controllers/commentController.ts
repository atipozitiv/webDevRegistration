import { Request, Response } from "express";
import { commentService } from "../services/commentService";

const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lesson, text } = req.body;

    if (!req.userId) {
      res.status(401).json({ error: "Ошибка аутентификации" });
      return;
    }

    if (!lesson || !text) {
      res.status(400).json({ error: "Пустой комментарий или урок не найден" });
      return;
    }

    if (text.length > 255) {
      res.status(400).json({ error: "Текст комментария не должен превышать 255 символов" });
      return;
    }

    const comment = await commentService.createComment({
      user: req.userId,
      lesson,
      text,
    });

    res.status(201).json({ comment });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const getByLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lessonId } = req.params;
    const comments = await commentService.getCommentsByLesson(lessonId);
    res.status(200).json({ comments });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!req.userId) {
      res.status(401).json({ error: "Ошибка аутентификации" });
      return;
    }

    if (!text) {
      res.status(400).json({ error: "Пустой комментарий" });
      return;
    }

    if (text.length > 255) {
      res.status(400).json({ error: "Текст комментария не должен превышать 255 символов" });
      return;
    }

    const isOwner = await commentService.isCommentOwner(id, req.userId);
    if (!isOwner) {
      res.status(403).json({ error: "Это не ваш комментарий" });
      return;
    }

    const comment = await commentService.updateComment(id, { text });

    if (!comment) {
      res.status(404).json({ error: "Комментарий не найден" });
      return;
    }

    res.status(200).json({ comment });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

const del = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.userId) {
      res.status(401).json({ error: "Ошибка аутентификации" });
      return;
    }

    const isOwner = await commentService.isCommentOwner(id, req.userId);
    if (!isOwner) {
      res.status(403).json({ error: "Это не ваш комментарий" });
      return;
    }

    const comment = await commentService.deleteComment(id);

    if (!comment) {
      res.status(404).json({ error: "Комментарий не найден" });
      return;
    }

    res.status(200).json({ message: "Комментарий удален" });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const commentController = {
  create,
  getByLesson,
  update,
  delete: del,
};