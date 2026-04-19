/**
 * Express application factory.
 * Separating `app` from `server.ts` makes the app easy to test.
 */

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import authRoutes from "./routes/auth.routes";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";

export function createApp(): express.Application {
  const app = express();

  // ─── Core Middleware ─────────────────────────────────────────────────────

  // Security headers
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // Parse JSON bodies
  app.use(express.json());

  // Parse URL-encoded bodies (form submissions)
  app.use(express.urlencoded({ extended: true }));

  /**
   * Cookie parser with HMAC signing.
   * `req.signedCookies` will only contain cookies whose signature is valid.
   * If a cookie has been tampered with, it will be `false` instead of the value.
   */
  app.use(cookieParser(env.cookies.secret));

  // Trust the first proxy in production (e.g. Nginx, Railway, Render)
  if (env.isProd) {
    app.set("trust proxy", 1);
  }

  // ─── Health Check ────────────────────────────────────────────────────────

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ─── Routes ──────────────────────────────────────────────────────────────

  app.use("/api/auth", authRoutes);

  // ─── Error Handling ──────────────────────────────────────────────────────

  // 404 — must be after all routes
  app.use(notFoundHandler);

  // Global error handler — must have 4 params for Express to recognise it
  app.use(errorHandler);

  return app;
}
