import { Router } from 'express';
import {authenticate} from '../middlewares/AuthMiddleware';
import { authController } from '../controllers/auth.controller';
import { loginRateLimiter, signupRateLimiter } from '../middlewares/rate-limit.middleware';

const router = Router();

router.post('/gauth', authController.googleAuth);
router.post('/signup', signupRateLimiter, authController.signup);
router.post('/login', loginRateLimiter, authenticate, authController.login);
router.post('/refresh', authenticate, authController.refreshToken);
router.post('/logout', authController.logout);

export default router;
