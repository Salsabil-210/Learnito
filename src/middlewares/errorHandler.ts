/**
 * Global Express error handler.
 *
 * Catches all errors propagated via `next(error)` and returns a
 * structured JSON response with a consistent shape.
 *
 * In production, stack traces are hidden from the client.
 */

import type { Request, Response, NextFunction } from "express";
import { OAuthError } from "../types";
import { env } from "../config/env";

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    stack?: string;
  };
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // ── Known OAuth errors ────────────────────────────────────────────────────
  if (err instanceof OAuthError) {
    console.error(`[ErrorHandler] ${err.name} (${err.code}): ${err.message}`);

    const body: ErrorResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(!env.isProd && { stack: err.stack }),
      },
    };

    res.status(err.statusCode).json(body);
    return;
  }

  // ── Unknown / unexpected errors ───────────────────────────────────────────
  const unexpectedError = err instanceof Error ? err : new Error(String(err));

  console.error("[ErrorHandler] Unhandled error:", unexpectedError);

  const body: ErrorResponse = {
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: env.isProd
        ? "An unexpected error occurred. Please try again."
        : unexpectedError.message,
      ...(!env.isProd && { stack: unexpectedError.stack }),
    },
  };

  res.status(500).json(body);
}

// ─── 404 Handler ──────────────────────────────────────────────────────────────

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.path} not found.`,
    },
  });
}
