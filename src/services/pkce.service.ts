/**
 * PKCE (Proof Key for Code Exchange) — RFC 7636
 *
 * Flow:
 *  1. Generate a cryptographically random `code_verifier`
 *  2. Derive a `code_challenge` = BASE64URL( SHA256( code_verifier ) )
 *  3. Send `code_challenge` to the auth server at the start of the flow
 *  4. Send `code_verifier` when exchanging the code for tokens
 *
 * The `state` parameter is used to prevent CSRF attacks.
 */

import crypto from "crypto";
import type { PKCEValues } from "../types";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Minimum verifier length per RFC 7636 §4.1 (43–128 chars) */
const VERIFIER_BYTE_LENGTH = 48; // → 64 Base64URL chars

/** State must be unpredictable; 32 bytes → 43 Base64URL chars */
const STATE_BYTE_LENGTH = 32;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Base64URL-encodes a Buffer without padding ("=" chars),
 * replacing "+" with "-" and "/" with "_" per RFC 4648 §5.
 */
function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generates a cryptographically secure `code_verifier` string.
 * Uses `crypto.randomBytes` — never `Math.random()`.
 */
export function generateCodeVerifier(): string {
  return base64UrlEncode(crypto.randomBytes(VERIFIER_BYTE_LENGTH));
}

/**
 * Derives the S256 `code_challenge` from a `code_verifier`.
 * challenge = BASE64URL( SHA256( ASCII( verifier ) ) )
 */
export function generateCodeChallenge(codeVerifier: string): string {
  const hash = crypto.createHash("sha256").update(codeVerifier).digest();
  return base64UrlEncode(hash);
}

/**
 * Generates a cryptographically secure `state` token.
 * Used to tie the authorization request to the callback and prevent CSRF.
 */
export function generateState(): string {
  return base64UrlEncode(crypto.randomBytes(STATE_BYTE_LENGTH));
}

/**
 * Convenience function: generates all three PKCE values in one call.
 */
export function generatePKCEValues(): PKCEValues {
  const codeVerifier = generateCodeVerifier();
  return {
    codeVerifier,
    codeChallenge: generateCodeChallenge(codeVerifier),
    state: generateState(),
  };
}

/**
 * Timing-safe state comparison to prevent timing-based side-channel attacks.
 */
export function compareStates(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}
