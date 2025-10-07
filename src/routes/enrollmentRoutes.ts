import { Router } from "express";
import { enrollmentController } from "../controllers/enrollmentController";
import { authenticateJWT } from "../middlewares/authMiddleware";

const router = Router();

router.post("/courses/:courseId/enroll", authenticateJWT, enrollmentController.enroll);
router.post("/lessons/:lessonId/complete", authenticateJWT, enrollmentController.completeLesson);
router.delete("/lessons/:lessonId/complete", authenticateJWT, enrollmentController.uncompleteLesson);
router.get("/courses/:courseId/progress", authenticateJWT, enrollmentController.getUserProgress);
router.get("/courses/:courseId/enrollments/count", enrollmentController.getCourseEnrollmentsCount);

export const enrollmentRoutes = router;                                                                                                                  