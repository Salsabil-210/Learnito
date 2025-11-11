import { Router } from 'express';
import {authenticate} from '../middlewares/AuthMiddleware';
import { authController } from '../controllers/auth.controller';

const router = Router();

router.post('/gauth', authController.googleAuth);
router.post('/signup', authController.signup);
router.post('/login', authenticate, authController.login);
router.post('/refresh', authenticate, authController.refreshToken);

export default router;
