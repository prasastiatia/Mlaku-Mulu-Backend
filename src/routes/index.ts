import { Router } from "express";
import authRoutes from "./auth";
import touristRoutes from "./tourists";
import tripRoutes from "./trips";

const router = Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Mlaku-Mulu Backend API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// API routes
router.use("/auth", authRoutes);
router.use("/tourists", touristRoutes);
router.use("/trips", tripRoutes);

export default router;
