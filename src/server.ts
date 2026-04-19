/**
 * Entry point.
 * Validates env, connects to the database, then starts the HTTP server.
 */

// Load env first — throws immediately if required vars are missing
import "./config/env";

import { createApp } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";

async function bootstrap(): Promise<void> {
  // 1. Verify database connectivity before accepting traffic
  try {
    await prisma.$connect();
    console.info("[Server] ✅ Database connection established.");
  } catch (error) {
    console.error("[Server] ❌ Failed to connect to the database:", error);
    process.exit(1);
  }

  // 2. Create and start the Express app
  const app = createApp();

  const server = app.listen(env.port, () => {
    console.info(`[Server] 🚀 Listening on http://localhost:${env.port}`);
    console.info(`[Server]    Environment : ${env.nodeEnv}`);
    console.info(`[Server]    Auth route  : GET /auth/twitter`);
    console.info(`[Server]    Callback    : GET /auth/twitter/callback`);
  });

  // 3. Graceful shutdown
  const shutdown = async (signal: string): Promise<void> => {
    console.info(`\n[Server] Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      await prisma.$disconnect();
      console.info("[Server] Database disconnected. Goodbye.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  // 4. Catch unhandled rejections to prevent silent failures
  process.on("unhandledRejection", (reason) => {
    console.error("[Server] Unhandled promise rejection:", reason);
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  console.error("[Server] Fatal startup error:", err);
  process.exit(1);
});
