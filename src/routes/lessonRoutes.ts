import { Router } from "express";
import { lessonController } from "../controllers/lessonController";
import { authenticateJWT } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authenticateJWT, lessonController.create);
router.get("/course/:courseId", lessonController.getByCourse);
router.get("/:id", lessonController.getById);
router.put("/:id", authenticateJWT, lessonController.update);
router.delete("/:id", authenticateJWT, lessonController.delete);

export const lessonRoutes = router;