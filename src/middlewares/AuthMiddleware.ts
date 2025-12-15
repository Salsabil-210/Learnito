import { Request, Response, NextFunction } from "express";
import { validateToken, JwtPayload } from "../utils/jwt";

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export interface RefreshTokenRequest extends Request {
  refreshToken: string;
  refreshTokenPayload: JwtPayload;
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const decoded = validateToken(token, "access");
  if (!decoded) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  (req as AuthenticatedRequest).user = decoded;
  next();
}

export function extractRefreshToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(400).json({ message: "Refresh token is required" });
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(400).json({ message: "Refresh token is required" });
    return;
  }

  const decoded = validateToken(token, "refresh");
  if (!decoded) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  (req as RefreshTokenRequest).refreshToken = token;
  (req as RefreshTokenRequest).refreshTokenPayload = decoded;
  next();
}
