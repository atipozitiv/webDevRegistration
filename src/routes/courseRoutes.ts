import { Router } from "express";
import { courseController } from "../controllers/courseController";
import { authenticateJWT } from "../middlewares/authMiddleware";
import { upload } from "../config/multer";

const router = Router();

router.get("/", courseController.getAll);
router.get("/:id", courseController.getById);
router.post("/", authenticateJWT, upload.single("image"), courseController.create);
router.put("/:id", authenticateJWT, upload.single("image"), courseController.update);
router.delete("/:id", authenticateJWT, courseController.delete);

router.post("/:courseId/favorite", authenticateJWT, courseController.addToFavorites);
router.delete("/:courseId/favorite", authenticateJWT, courseController.removeFromFavorites);
router.get("/user/favorites", authenticateJWT, courseController.getFavorites);

export const courseRoutes = router;