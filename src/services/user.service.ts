/**
 * Fetches the authenticated user's Twitter profile and upserts them
 * into our PostgreSQL database via Prisma.
 *
 * Database strategy:
 *  - `User` is the core identity record (keyed by twitterId / email).
 *  - `OAuthAccount` stores the provider tokens and is linked to User.
 *  - An upsert is used so re-authenticating users refresh their tokens
 *    without creating duplicate rows.
 */

import axios from "axios";
import { prisma } from "../config/prisma";
import { env } from "../config/env";
import type { TwitterUserResponse, TwitterTokenResponse } from "../types";
import { OAuthError } from "../types";

interface UserRecord {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  twitterId: string | null;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  email: string | null;
}

// ─── Twitter Profile ──────────────────────────────────────────────────────────

/**
 * Calls Twitter's `/2/users/me` endpoint and returns the raw profile.
 * Requires an active access token with `users.read` scope.
 */
async function fetchTwitterProfile(
  accessToken: string
): Promise<TwitterUserResponse["data"]> {
  const fields = "id,name,username,profile_image_url,description";

  try {
    const response = await axios.get<TwitterUserResponse>(
      `${env.twitter.userUrl}?user.fields=${fields}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 500;
      const message = (error.response?.data as { detail?: string } | undefined)?.detail ?? error.message;

      if (status === 401) {
        throw new OAuthError(
          "PROFILE_FETCH_UNAUTHORIZED",
          `Access token is invalid or expired: ${message}`,
          401
        );
      }
      throw new OAuthError(
        "PROFILE_FETCH_FAILED",
        `Failed to fetch Twitter profile: ${message}`,
        status
      );
    }
    throw new OAuthError(
      "PROFILE_FETCH_UNKNOWN",
      "Unexpected error fetching Twitter profile.",
      500
    );
  }
}

// ─── Database Upsert ──────────────────────────────────────────────────────────

/**
 * Upserts the Twitter user into the database and stores their tokens.
 *
 * Steps:
 *  1. Fetch the Twitter profile with the access token.
 *  2. Find or create the `User` row (match on twitterId).
 *  3. Upsert the `OAuthAccount` row (match on provider + providerId).
 *
 * @param tokenData - The full token response from the code exchange.
 * @returns The upserted User record.
 */
export async function upsertTwitterUser(
  tokenData: TwitterTokenResponse
): Promise<UserRecord> {
  // 1. Fetch live profile from Twitter
  const profile = await fetchTwitterProfile(tokenData.access_token);

  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

  // 2. Find existing user or create new one
  let user = await prisma.user.findFirst({
    where: { twitterId: profile.id },
  });

  if (!user) {
    // Create new user if not found
    user = await prisma.user.create({
      data: {
        twitterId: profile.id,
        username: profile.username,
        displayName: profile.name,
        avatarUrl: profile.profile_image_url ?? null,
      },
    });
  } else {
    // Update existing user with latest profile info
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        username: profile.username,
        displayName: profile.name,
        avatarUrl: profile.profile_image_url ?? null,
      },
    });
  }

  // 3. Upsert OAuthAccount (create or refresh tokens)
  await prisma.oAuthAccount.upsert({
    where: {
      provider_providerId: {
        provider: "twitter",
        providerId: profile.id,
      },
    },
    update: {
      accessToken: tokenData.access_token,
      // Twitter may or may not return a new refresh token on re-auth;
      // only overwrite if a new one was provided.
      ...(tokenData.refresh_token && {
        refreshToken: tokenData.refresh_token,
      }),
      expiresAt,
      scope: tokenData.scope,
    },
    create: {
      provider: "twitter",
      providerId: profile.id,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token ?? null,
      expiresAt,
      scope: tokenData.scope,
      userId: user.id,
    },
  });

  console.info(
    `[UserService] Upserted user @${profile.username} (twitterId: ${profile.id}, userId: ${user.id})`
  );

  return user as UserRecord;
}
