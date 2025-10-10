import { Router } from 'express';
import { commentController } from '../controllers/commentController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticateJWT, commentController.create);
router.get('/lesson/:lessonId', commentController.getByLesson);
router.put('/:id', authenticateJWT, commentController.update);
router.delete('/:id', authenticateJWT, commentController.delete);

export { router as commentRoutes };