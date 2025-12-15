import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { extractRefreshToken } from '../middlewares/AuthMiddleware';

const router = Router();

router.post('/google', authController.googleAuth);
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/refresh-token', extractRefreshToken, authController.refreshToken);
router.post('/logout', extractRefreshToken, authController.logout);

export default router;
