import "dotenv/config";

/**
 * Validates that a required env variable exists and is non-empty.
 * Throws at startup so missing config is caught immediately.
 */
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === "") {
    throw new Error(
      `[Config] Missing required environment variable: "${key}". ` +
        `Copy .env.example to .env and fill in all values.`
    );
  }
  return value.trim();
}

function optionalEnv(key: string, fallback: string): string {
  return process.env[key]?.trim() || fallback;
}

export const env = {
  nodeEnv: optionalEnv("NODE_ENV", "development"),
  port: parseInt(optionalEnv("PORT", "3000"), 10),
  isProd: process.env.NODE_ENV === "production",

  db: {
    url: requireEnv("DATABASE_URL"),
  },

  twitter: {
    clientId: requireEnv("TWITTER_CLIENT_ID"),
    clientSecret: requireEnv("TWITTER_CLIENT_SECRET"),
    callbackUrl: requireEnv("TWITTER_CALLBACK_URL"),
    /** Scopes requested from the user */
    scopes: ["tweet.read", "users.read", "offline.access"] as const,
    /** X OAuth 2.0 endpoints */
    authorizationUrl: "https://twitter.com/i/oauth2/authorize",
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
    userUrl: "https://api.twitter.com/2/users/me",
  },

  cookies: {
    secret: requireEnv("COOKIE_SECRET"),
    /** How long the PKCE / state cookies live (10 minutes — enough for the redirect) */
    maxAgeMs: 10 * 60 * 1000,
  },

  auth: {
    successRedirect: optionalEnv(
      "AUTH_SUCCESS_REDIRECT_URL",
      "http://localhost:3000/dashboard"
    ),
  },
} as const;
