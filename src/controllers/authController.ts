import { Request, Response } from "express";
import { authService } from "../services/authService";

const register = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const user = await authService.registerUser(username, password);
    const token = authService.generateToken(user._id.toString());
    res.status(201).json({ token });
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const user = await authService.loginUser(username, password);
    const token = authService.generateToken(user._id.toString());
    res.status(200).json({ token });
  } catch (err) {
    res.status(400).json({ err });
  }
};

const getInfo = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    res.status(200).json({ });
  } catch (err) {
    res.status(400).json({ err });
  }
};

const del = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    
    res.status(200).send("Пользователь удален.");
  } catch (err) {
    res.status(400).json({ err });
  }
}

export const authController = {
  register,
  login,
  getInfo,
  del,
};
