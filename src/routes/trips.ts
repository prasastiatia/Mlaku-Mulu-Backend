import { Router } from "express";
import { TripController } from "../controllers/TripController";
import {
  authenticateToken,
  requireEmployee,
  requireTourist,
} from "../middleware/auth";
import {
  validateRequest,
  createTripSchema,
  updateTripSchema,
} from "../middleware/validation";

const router = Router();

/**
 * @route GET /api/trips
 * @desc Get all trips
 * @access Private (Employee only)
 */
router.get("/", authenticateToken, requireEmployee, TripController.getAllTrips);

/**
 * @route GET /api/trips/my
 * @desc Get current tourist's trips
 * @access Private (Tourist only)
 */
router.get("/my", authenticateToken, requireTourist, TripController.getMyTrips);

/**
 * @route GET /api/trips/upcoming
 * @desc Get upcoming trips
 * @access Private (Employee only)
 */
router.get(
  "/upcoming",
  authenticateToken,
  requireEmployee,
  TripController.getUpcomingTrips
);

/**
 * @route GET /api/trips/:id
 * @desc Get trip by ID
 * @access Private (Employee or Tourist who owns the trip)
 */
router.get("/:id", authenticateToken, TripController.getTripById);

/**
 * @route GET /api/trips/tourist/:touristId
 * @desc Get trips by tourist ID
 * @access Private (Employee or Tourist who owns the trips)
 */
router.get(
  "/tourist/:touristId",
  authenticateToken,
  TripController.getTripsByTourist
);

/**
 * @route POST /api/trips
 * @desc Create new trip
 * @access Private (Employee only)
 */
router.post(
  "/",
  authenticateToken,
  requireEmployee,
  validateRequest(createTripSchema),
  TripController.createTrip
);

/**
 * @route PUT /api/trips/:id
 * @desc Update trip
 * @access Private (Employee only)
 */
router.put(
  "/:id",
  authenticateToken,
  requireEmployee,
  validateRequest(updateTripSchema),
  TripController.updateTrip
);

/**
 * @route DELETE /api/trips/:id
 * @desc Delete trip
 * @access Private (Employee only)
 */
router.delete(
  "/:id",
  authenticateToken,
  requireEmployee,
  TripController.deleteTrip
);

export default router;
