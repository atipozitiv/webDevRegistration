import { Router } from "express";
import { courseController } from "../controllers/courseController";

const router = Router();

router.post("/signup", authController.register);
router.post("/signin", authController.login);
router.get("/me", authenticateJWT, authController.getInfo);
router.delete("/del", authenticateJWT, authController.del);

export const courseRoutes = router;