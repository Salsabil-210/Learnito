import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { RefreshTokenRequest } from "../middlewares/AuthMiddleware";
import { env } from "../config/env";
import { generatePKCEValues, compareStates } from "../services/pkce.service";
import { exchangeCodeForTokens } from "../services/token.service";
import { upsertTwitterUser } from "../services/user.service";
import {
  StateMismatchError,
  AccessDeniedError,
  OAuthError,
} from "../types";

// ─── Cookie Names ─────────────────────────────────────────────────────────────

const COOKIE_VERIFIER = "pkce_verifier";
const COOKIE_STATE = "oauth_state";

// ─── Cookie Options ───────────────────────────────────────────────────────────

/**
 * Shared secure cookie options.
 * `signed: true` means Express will HMAC the value using COOKIE_SECRET,
 * so tampering is detectable.
 */
const secureCookieOptions = {
  httpOnly: true,
  secure: env.isProd,        // HTTPS-only in production
  sameSite: "lax" as const,  // Allows the Twitter redirect to carry the cookie
  maxAge: env.cookies.maxAgeMs,
  signed: true,
} as const;

// ─── Existing Auth Handlers ───────────────────────────────────────────────────

export const authController = {

  async googleAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { idToken } = req.body;
      const result = await authService.googleAuth(idToken);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.signup(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json({
        accessToken: result.accessToken,
      });
    } catch (error) {
      next(error);
    }
  },

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken, refreshTokenPayload } = req as RefreshTokenRequest;
      const result = await authService.refreshToken(refreshTokenPayload, refreshToken);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req as RefreshTokenRequest;
      const result = await authService.logout(refreshToken);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  // ─── Twitter OAuth Handlers ───────────────────────────────────────────────

  /**
   * GET /auth/twitter
   *
   * 1. Generates PKCE values and a CSRF state token.
   * 2. Stores `code_verifier` and `state` in signed HttpOnly cookies.
   * 3. Redirects the user to X's authorization URL.
   */
  async initiateTwitterAuth(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { codeVerifier, codeChallenge, state } = generatePKCEValues();

      // Store PKCE verifier and state in short-lived, signed, HttpOnly cookies
      res.cookie(COOKIE_VERIFIER, codeVerifier, secureCookieOptions);
      res.cookie(COOKIE_STATE, state, secureCookieOptions);

      // Build the Twitter authorization URL
      const params = new URLSearchParams({
        response_type: "code",
        client_id: env.twitter.clientId,
        redirect_uri: env.twitter.callbackUrl,
        scope: env.twitter.scopes.join(" "),
        state,
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
      });

      const authUrl = `${env.twitter.authorizationUrl}?${params.toString()}`;

      console.info("[AuthController] Redirecting user to Twitter OAuth:", {
        state: state.slice(0, 8) + "...",
        scopes: env.twitter.scopes,
      });

      res.redirect(302, authUrl);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /auth/twitter/callback
   *
   * Called by Twitter after the user grants (or denies) permission.
   *
   * 1. Checks for an `error` param (user denied access).
   * 2. Validates the `state` param against the signed cookie (CSRF protection).
   * 3. Reads `code_verifier` from the signed cookie.
   * 4. Exchanges `code` + `code_verifier` for tokens.
   * 5. Upserts the user in the database.
   * 6. Clears PKCE cookies and redirects to the app.
   */
  async handleTwitterCallback(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { code, state, error: twitterError } = req.query as Record<string, string | undefined>;

      // ── Step 1: Check if the user denied the OAuth request ────────────────────
      if (twitterError === "access_denied" || !code) {
        throw new AccessDeniedError();
      }

      // ── Step 2: Read signed cookies (returns undefined if tampered) ───────────
      const storedState = req.signedCookies[COOKIE_STATE] as string | undefined;
      const codeVerifier = req.signedCookies[COOKIE_VERIFIER] as string | undefined;

      if (!storedState || !codeVerifier) {
        throw new OAuthError(
          "MISSING_COOKIES",
          "PKCE cookies are missing or expired. Please start the login flow again.",
          400
        );
      }

      // ── Step 3: Validate state (CSRF protection) ──────────────────────────────
      if (!state || !compareStates(state, storedState)) {
        throw new StateMismatchError();
      }

      // ── Step 4: Clear PKCE cookies immediately — they are single-use ─────────
      res.clearCookie(COOKIE_VERIFIER);
      res.clearCookie(COOKIE_STATE);

      // ── Step 5: Exchange authorization code for tokens ────────────────────────
      const tokenData = await exchangeCodeForTokens(code, codeVerifier);

      // ── Step 6: Fetch Twitter profile and upsert user in the database ─────────
      const user = await upsertTwitterUser(tokenData);

      console.info(
        `[AuthController] Authentication successful for user: ${user.id} (@${user.username})`
      );

      // ── Step 7: Redirect to the application ──────────────────────────────────
      // In a real app: set a session cookie / JWT here before redirecting.
      res.redirect(302, env.auth.successRedirect);
    } catch (error) {
      // Clear cookies on any error to avoid stale PKCE state
      res.clearCookie(COOKIE_VERIFIER);
      res.clearCookie(COOKIE_STATE);
      next(error);
    }
  },
};
