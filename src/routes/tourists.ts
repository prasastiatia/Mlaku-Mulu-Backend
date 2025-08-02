import { Router } from "express";
import { TouristController } from "../controllers/TouristController";
import { authenticateToken, requireEmployee } from "../middleware/auth";
import {
  validateRequest,
  createTouristSchema,
  updateTouristSchema,
} from "../middleware/validation";

const router = Router();

/**
 * @route GET /api/tourists
 * @desc Get all tourists
 * @access Private (Employee only)
 */
router.get(
  "/",
  authenticateToken,
  requireEmployee,
  TouristController.getAllTourists
);

/**
 * @route GET /api/tourists/:id
 * @desc Get tourist by ID
 * @access Private (Employee only)
 */
router.get(
  "/:id",
  authenticateToken,
  requireEmployee,
  TouristController.getTouristById
);

/**
 * @route POST /api/tourists
 * @desc Create new tourist
 * @access Private (Employee only)
 */
router.post(
  "/",
  authenticateToken,
  requireEmployee,
  validateRequest(createTouristSchema),
  TouristController.createTourist
);

/**
 * @route PUT /api/tourists/:id
 * @desc Update tourist
 * @access Private (Employee only)
 */
router.put(
  "/:id",
  authenticateToken,
  requireEmployee,
  validateRequest(updateTouristSchema),
  TouristController.updateTourist
);

/**
 * @route DELETE /api/tourists/:id
 * @desc Delete tourist
 * @access Private (Employee only)
 */
router.delete(
  "/:id",
  authenticateToken,
  requireEmployee,
  TouristController.deleteTourist
);

export default router;
