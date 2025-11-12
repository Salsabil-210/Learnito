import { Router } from 'express';
import {authenticate} from '../middlewares/AuthMiddleware';
import { authController } from '../controllers/auth.controller';
import { loginRateLimiter, signupRateLimiter, authRateLimiter } from '../middlewares/rate-limit.middleware';

const router = Router();

router.post('/gauth', authRateLimiter, authController.googleAuth);
router.post('/signup', signupRateLimiter, authController.signup);
router.post('/login', loginRateLimiter, authenticate, authController.login);
router.post('/refresh', authRateLimiter, authenticate, authController.refreshToken);
router.post('/logout', authRateLimiter, authController.logout);

export default router;
