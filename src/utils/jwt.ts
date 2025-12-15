import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import type { SignOptions } from "jsonwebtoken";
import ms from "ms";

dotenv.config();

const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;
const accessExpires = process.env.JWT_ACCESS_EXPIRES ?? "15m";
const refreshExpires = process.env.JWT_REFRESH_EXPIRES ?? "7d";

if (!accessSecret) throw new Error("Missing env: JWT_ACCESS_SECRET");
if (!refreshSecret) throw new Error("Missing env: JWT_REFRESH_SECRET");

const ACCESS_SECRET: string = accessSecret;
const REFRESH_SECRET: string = refreshSecret;

export type JwtPayload = { userId: string; email: string };

export function generateAccessToken(payload: JwtPayload): string {
  const options: SignOptions = { expiresIn: accessExpires as ms.StringValue };
  return jwt.sign(payload, ACCESS_SECRET, options);
}

export function generateRefreshToken(payload: JwtPayload): string {
  const options: SignOptions = { expiresIn: refreshExpires as ms.StringValue };
  return jwt.sign(payload, REFRESH_SECRET, options);
}

export function validateToken(token: string, type: "access" | "refresh"): JwtPayload | null {
  const secret = type === "access" ? ACCESS_SECRET : REFRESH_SECRET;
  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch {
    return null;
  }
}