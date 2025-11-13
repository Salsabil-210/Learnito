import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';

export const authController = {

  async googleAuth(req: Request, res: Response, next: NextFunction) {
    try{
      const { idToken } = req.body;
      const result = await authService.googleAuth(idToken);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.signup(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
