import { Router } from 'express';
import {authenticate} from '../middlewares/AuthMiddleware';
import { authController } from '../controllers/auth.controller';
import { authRateLimiter, loginRateLimiter, refreshTokenRateLimiter, signupRateLimiter } from '../utils/rateLimiter';

const router = Router();

router.post('/gauth', authRateLimiter, authController.googleAuth);
router.post('/signup', signupRateLimiter, authController.signup);
router.post('/login', loginRateLimiter, authenticate, authController.login);
router.post('/refresh', refreshTokenRateLimiter, authenticate, authController.refreshToken);

export default router;
