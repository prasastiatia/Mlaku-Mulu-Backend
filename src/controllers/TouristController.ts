import { Response } from "express";
import { TouristModel } from "../models/Tourist";
import {
  CreateTouristRequest,
  UpdateTouristRequest,
  ApiResponse,
} from "../types/index";
import { AuthenticatedRequest } from "../middleware/auth";
import { AppError } from "../middleware/error";

export class TouristController {
  static async getAllTourists(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const tourists = await TouristModel.findAll();

      res.json({
        success: true,
        message: "Tourists retrieved successfully",
        data: tourists,
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

  static async getTouristById(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;

      if (id !== undefined) {
        const tourist = await TouristModel.findById(id);
        if (!tourist) {
          res.status(404).json({
            success: false,
            message: "Tourist not found",
          } as ApiResponse);
          return;
        }

        res.json({
          success: true,
          message: "Tourist retrieved successfully",
          data: tourist,
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

  static async createTourist(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const touristData: CreateTouristRequest = req.body;

      const newTourist = await TouristModel.create(touristData);

      res.status(201).json({
        success: true,
        message: "Tourist created successfully",
        data: newTourist,
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

  static async updateTourist(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateTouristRequest = req.body;

      if (id !== undefined) {
        const updatedTourist = await TouristModel.update(id, updateData);
        if (!updatedTourist) {
          res.status(404).json({
            success: false,
            message: "Tourist not found",
          } as ApiResponse);
          return;
        }

        res.json({
          success: true,
          message: "Tourist updated successfully",
          data: updatedTourist,
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

  static async deleteTourist(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;
      if (id !== undefined) {
        const deleted = await TouristModel.delete(id);
        if (!deleted) {
          res.status(404).json({
            success: false,
            message: "Tourist not found",
          } as ApiResponse);
          return;
        }

        res.json({
          success: true,
          message: "Tourist deleted successfully",
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
}
