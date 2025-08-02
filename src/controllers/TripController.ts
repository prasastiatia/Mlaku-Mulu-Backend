import { Response } from "express";
import { TripModel } from "../models/Trip";
import { TouristModel } from "../models/Tourist";
import {
  CreateTripRequest,
  UpdateTripRequest,
  ApiResponse,
  UserRole,
} from "../types/index";
import { AuthenticatedRequest } from "../middleware/auth";
import { AppError } from "../middleware/error";

export class TripController {
  static async getAllTrips(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const trips = await TripModel.findAll();

      res.json({
        success: true,
        message: "Trips retrieved successfully",
        data: trips,
      } as ApiResponse);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        } as ApiResponse);
      } else {
        res.status(500).json({
          success: false,
          message: "Internal server error",
        } as ApiResponse);
      }
    }
  }

  static async getTripById(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;
      if (id !== undefined) {
        const trip = await TripModel.findById(id);
        if (!trip) {
          res.status(404).json({
            success: false,
            message: "Trip not found",
          } as ApiResponse);
          return;
        }

        // If user is a tourist, only allow access to their own trips
        if (req.user?.role === UserRole.TOURIST) {
          const tourist = await TouristModel.findByUserId(req.user.userId);
          if (!tourist || trip.touristId !== tourist.id) {
            res.status(403).json({
              success: false,
              message: "Access denied",
            } as ApiResponse);
            return;
          }
        }

        res.json({
          success: true,
          message: "Trip retrieved successfully",
          data: trip,
        } as ApiResponse);
      }
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        } as ApiResponse);
      } else {
        res.status(500).json({
          success: false,
          message: "Internal server error",
        } as ApiResponse);
      }
    }
  }

  static async getTripsByTourist(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { touristId } = req.params;

      // If user is a tourist, only allow access to their own trips
      if (req.user?.role === UserRole.TOURIST) {
        const tourist = await TouristModel.findByUserId(req.user.userId);
        if (!tourist || tourist.id !== touristId) {
          res.status(403).json({
            success: false,
            message: "Access denied",
          } as ApiResponse);
          return;
        }
      }

      if (touristId !== undefined) {
        const trips = await TripModel.findByTouristId(touristId);

        res.json({
          success: true,
          message: "Tourist trips retrieved successfully",
          data: trips,
        } as ApiResponse);
      }
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        } as ApiResponse);
      } else {
        res.status(500).json({
          success: false,
          message: "Internal server error",
        } as ApiResponse);
      }
    }
  }

  static async getMyTrips(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (req.user?.role !== UserRole.TOURIST) {
        res.status(403).json({
          success: false,
          message: "Only tourists can access this endpoint",
        } as ApiResponse);
        return;
      }

      const tourist = await TouristModel.findByUserId(req.user.userId);
      if (!tourist) {
        res.status(404).json({
          success: false,
          message: "Tourist profile not found",
        } as ApiResponse);
        return;
      }

      const trips = await TripModel.findByTouristId(tourist.id);

      res.json({
        success: true,
        message: "Your trips retrieved successfully",
        data: trips,
      } as ApiResponse);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        } as ApiResponse);
      } else {
        res.status(500).json({
          success: false,
          message: "Internal server error",
        } as ApiResponse);
      }
    }
  }

  static async createTrip(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const tripData: CreateTripRequest = req.body;

      // Verify tourist exists
      const tourist = await TouristModel.findById(tripData.touristId);
      if (!tourist) {
        res.status(404).json({
          success: false,
          message: "Tourist not found",
        } as ApiResponse);
        return;
      }

      const newTrip = await TripModel.create(tripData);

      res.status(201).json({
        success: true,
        message: "Trip created successfully",
        data: newTrip,
      } as ApiResponse);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        } as ApiResponse);
      } else {
        res.status(500).json({
          success: false,
          message: "Internal server error",
        } as ApiResponse);
      }
    }
  }

  static async updateTrip(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateTripRequest = req.body;

      if (id !== undefined) {
        const existingTrip = await TripModel.findById(id);
        if (!existingTrip) {
          res.status(404).json({
            success: false,
            message: "Trip not found",
          } as ApiResponse);
          return;
        }

        const updatedTrip = await TripModel.update(id, updateData);

        res.json({
          success: true,
          message: "Trip updated successfully",
          data: updatedTrip,
        } as ApiResponse);
      }
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        } as ApiResponse);
      } else {
        res.status(500).json({
          success: false,
          message: "Internal server error",
        } as ApiResponse);
      }
    }
  }

  static async deleteTrip(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;

      if (id !== undefined) {
        const deleted = await TripModel.delete(id);
        if (!deleted) {
          res.status(404).json({
            success: false,
            message: "Trip not found",
          } as ApiResponse);
          return;
        }

        res.json({
          success: true,
          message: "Trip deleted successfully",
        } as ApiResponse);
      }
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        } as ApiResponse);
      } else {
        res.status(500).json({
          success: false,
          message: "Internal server error",
        } as ApiResponse);
      }
    }
  }

  static async getUpcomingTrips(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const trips = await TripModel.findUpcomingTrips();

      res.json({
        success: true,
        message: "Upcoming trips retrieved successfully",
        data: trips,
      } as ApiResponse);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        } as ApiResponse);
      } else {
        res.status(500).json({
          success: false,
          message: "Internal server error",
        } as ApiResponse);
      }
    }
  }
}
