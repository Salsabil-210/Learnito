/**
 * Handles all OAuth 2.0 token operations with the X (Twitter) API:
 *  - Code → Token exchange (authorization_code grant)
 *  - Token rotation via refresh_token (offline.access scope)
 */

import axios, { AxiosError } from "axios";
import { prisma } from "../config/prisma";
import { env } from "../config/env";
import type { TwitterTokenResponse, RefreshedTokens } from "../types";
import { OAuthError, TokenExpiredError } from "../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Builds the Basic Auth header required by Twitter's token endpoint.
 * Format: "Basic base64(clientId:clientSecret)"
 */
function buildBasicAuthHeader(): string {
  const credentials = `${env.twitter.clientId}:${env.twitter.clientSecret}`;
  return `Basic ${Buffer.from(credentials).toString("base64")}`;
}

/**
 * Converts a Twitter `expires_in` (seconds) to an absolute Date.
 * Subtracts 60s as a safety buffer to avoid using an almost-expired token.
 */
function expiresAtFromSeconds(expiresIn: number): Date {
  const bufferSeconds = 60;
  return new Date(Date.now() + (expiresIn - bufferSeconds) * 1000);
}

// ─── Code Exchange ────────────────────────────────────────────────────────────

/**
 * Exchanges an authorization `code` + `code_verifier` for an access token
 * and optional refresh token.
 *
 * Uses the `authorization_code` grant with PKCE (RFC 7636).
 */
export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string
): Promise<TwitterTokenResponse> {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: env.twitter.callbackUrl,
    code_verifier: codeVerifier,
    client_id: env.twitter.clientId,
  });

  try {
    const response = await axios.post<TwitterTokenResponse>(
      env.twitter.tokenUrl,
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: buildBasicAuthHeader(),
        },
      }
    );

    return response.data;
  } catch (error: unknown) {
    throw mapAxiosError(error, "token exchange");
  }
}

// ─── Token Rotation ───────────────────────────────────────────────────────────

/**
 * Refreshes the access token for a given user using their stored refresh token.
 *
 * Twitter's `offline.access` scope enables refresh tokens. After a successful
 * refresh, Twitter issues a new refresh token — the old one is invalidated.
 * We update the database atomically.
 *
 * @param userId - The internal (cuid) user ID from our database.
 */
export async function refreshTwitterToken(
  userId: string
): Promise<RefreshedTokens> {
  // 1. Fetch the stored OAuth account for this usercc
  const account = await prisma.oAuthAccount.findFirst({
    where: { userId, provider: "twitter" },
  });

  if (!account) {
    throw new OAuthError(
      "NO_OAUTH_ACCOUNT",
      `No Twitter OAuth account found for user "${userId}".`,
      404
    );
  }

  if (!account.refreshToken) {
    throw new OAuthError(
      "NO_REFRESH_TOKEN",
      `User "${userId}" has no refresh token. ` +
        `They must re-authenticate with the "offline.access" scope.`,
      401
    );
  }

  // 2. Check whether the token has already expired in our DB
  if (account.expiresAt && account.expiresAt < new Date()) {
    // Attempt refresh — if the refresh token is also expired, Twitter will error
    console.warn(
      `[TokenService] Access token for user "${userId}" is past expiry. Attempting refresh.`
    );
  }

  // 3. Call Twitter's token refresh endpoint
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: account.refreshToken,
    client_id: env.twitter.clientId,
  });

  let refreshedData: TwitterTokenResponse;

  try {
    const response = await axios.post<TwitterTokenResponse>(
      env.twitter.tokenUrl,
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: buildBasicAuthHeader(),
        },
      }
    );
    refreshedData = response.data;
  } catch (error: unknown) {
    // If Twitter returns 401 on a refresh, the refresh token itself has expired
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new TokenExpiredError(userId);
    }
    throw mapAxiosError(error, "token refresh");
  }

  const expiresAt = expiresAtFromSeconds(refreshedData.expires_in);

  // 4. Persist new tokens — old refresh token is now invalid
  await prisma.oAuthAccount.update({
    where: { id: account.id },
    data: {
      accessToken: refreshedData.access_token,
      refreshToken: refreshedData.refresh_token ?? account.refreshToken,
      expiresAt,
    },
  });

  return {
    accessToken: refreshedData.access_token,
    refreshToken: refreshedData.refresh_token ?? null,
    expiresAt,
  };
}

// ─── Error Mapping ────────────────────────────────────────────────────────────

function mapAxiosError(error: unknown, context: string): OAuthError {
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<{ error?: string; error_description?: string }>;
    const twitterErr = axiosErr.response?.data;
    const status = axiosErr.response?.status ?? 500;
    const description =
      twitterErr?.error_description ?? axiosErr.message;

    console.error(`[TokenService] ${context} failed (${status}):`, twitterErr);

    if (status === 401) {
      return new OAuthError("UNAUTHORIZED", `Twitter rejected the ${context}: ${description}`, 401);
    }
    if (status === 400) {
      return new OAuthError("BAD_REQUEST", `Invalid parameters for ${context}: ${description}`, 400);
    }
    return new OAuthError("TWITTER_API_ERROR", `Twitter ${context} error: ${description}`, status);
  }

  if (error instanceof Error) {
    return new OAuthError("UNKNOWN_ERROR", `Unexpected error during ${context}: ${error.message}`, 500);
  }

  return new OAuthError("UNKNOWN_ERROR", `Unexpected error during ${context}.`, 500);
}
