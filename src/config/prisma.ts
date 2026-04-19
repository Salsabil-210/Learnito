import { PrismaClient } from "@prisma/client";
import { env } from "./env";

declare global {
  // Prevent multiple Prisma instances during hot-reload in development
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log:
      env.nodeEnv === "development"
        ? ["query", "warn", "error"]
        : ["warn", "error"],
  });
}

export const prisma: PrismaClient =
  global.__prisma ?? createPrismaClient();

if (env.nodeEnv !== "production") {
  global.__prisma = prisma;
}
