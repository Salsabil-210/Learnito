import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, JwtPayload } from "../utils/jwt";

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const decoded = verifyAccessToken(token);
  if (!decoded) return res.status(401).json({ message: "Invalid or expired token" });


  next();
}
