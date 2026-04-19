// ─── PKCE ─────────────────────────────────────────────────────────────────────

export interface PKCEValues {
  codeVerifier: string;
  codeChallenge: string;
  state: string;
}

// ─── Twitter API ──────────────────────────────────────────────────────────────

export interface TwitterTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface TwitterUserResponse {
  data: {
    id: string;
    name: string;
    username: string;
    profile_image_url?: string;
    description?: string;
  };
}

// ─── Token Refresh ────────────────────────────────────────────────────────────

export interface RefreshedTokens {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date;
}

// ─── Errors ───────────────────────────────────────────────────────────────────

export class OAuthError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 400
  ) {
    super(message);
    this.name = "OAuthError";
  }
}

export class TokenExpiredError extends OAuthError {
  constructor(userId: string) {
    super(
      "TOKEN_EXPIRED",
      `Access token for user "${userId}" has expired. Please re-authenticate.`,
      401
    );
    this.name = "TokenExpiredError";
  }
}

export class StateMismatchError extends OAuthError {
  constructor() {
    super(
      "STATE_MISMATCH",
      "OAuth state parameter mismatch — possible CSRF attack. Request rejected.",
      403
    );
    this.name = "StateMismatchError";
  }
}

export class AccessDeniedError extends OAuthError {
  constructor() {
    super(
      "ACCESS_DENIED",
      "The user denied the OAuth permission request.",
      403
    );
    this.name = "AccessDeniedError";
  }
}
