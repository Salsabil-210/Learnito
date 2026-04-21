import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { extractRefreshToken } from "../middlewares/AuthMiddleware";

const router = Router();

// ─── Existing Auth Routes ───────────────────────────────────────────────────

router.post("/google", authController.googleAuth);
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/refresh-token", extractRefreshToken, authController.refreshToken);
router.post("/logout", extractRefreshToken, authController.logout);

// ─── Twitter OAuth Routes ───────────────────────────────────────────────────

/**
 * GET /auth/twitter
 * Starts the OAuth 2.0 + PKCE flow — redirects user to X.
 */
router.get("/twitter", authController.initiateTwitterAuth);

/**
 * GET /auth/twitter/callback
 * X redirects here after the user grants or denies permission.
 */
router.get("/twitter/callback", authController.handleTwitterCallback);

export default router;

