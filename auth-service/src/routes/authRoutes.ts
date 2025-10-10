import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

router.post('/signup', authController.register);
router.post('/signin', authController.login);
router.get('/me', authenticateJWT, authController.getInfo);
router.delete('/del', authenticateJWT, authController.del);

export { router as authRoutes };