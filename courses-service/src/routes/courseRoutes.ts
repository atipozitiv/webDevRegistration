import { Router } from 'express';
import { courseController } from '../controllers/courseController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.get('/', courseController.getAll);
router.get('/:id', courseController.getById);
router.post('/', authenticateJWT, courseController.create);
router.put('/:id', authenticateJWT, courseController.update);
router.delete('/:id', authenticateJWT, courseController.delete);

router.post('/:courseId/favorite', authenticateJWT, courseController.addToFavorites);
router.delete('/:courseId/favorite', authenticateJWT, courseController.removeFromFavorites);
router.get('/user/favorites', authenticateJWT, courseController.getFavorites);

export { router as courseRoutes };