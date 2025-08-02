import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { validateRequest, loginSchema } from "../middleware/validation";
import { authenticateToken } from "../middleware/auth";

const router = Router();

/**
 * @route POST /api/auth/login
 * @desc Login user (employee or tourist)
 * @access Public
 */
router.post("/login", validateRequest(loginSchema), AuthController.login);

/**
 * @route POST /api/auth/register
 * @desc Register new user
 * @access Public
 */
router.post("/register", AuthController.register);

/**
 * @route GET /api/auth/profile
 * @desc Get user profile
 * @access Private
 */
router.get("/profile", authenticateToken, AuthController.getProfile);

export default router;
