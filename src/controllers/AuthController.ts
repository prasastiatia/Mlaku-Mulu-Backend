import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { UserModel } from "../models/User";
import { TouristModel } from "../models/Tourist";
import {
  LoginRequest,
  LoginResponse,
  ApiResponse,
  UserRole,
} from "../types/index";
import { AppError } from "../middleware/error";

export class AuthController {
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginRequest = req.body;

      // Find user by email
      const user = await UserModel.findByEmail(email);
      if (!user) {
        res.status(401).json({
          success: false,
          message: "Invalid credentials",
        } as ApiResponse);
        return;
      }

      // Validate password
      const isValidPassword = await UserModel.validatePassword(user, password);
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          message: "Invalid credentials",
        } as ApiResponse);
        return;
      }

      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new AppError("JWT secret not configured", 500);
      }

      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        jwtSecret,
        { expiresIn: "24h" }
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: "Login successful",
        data: {
          user: userWithoutPassword,
          token,
        } as LoginResponse,
      } as ApiResponse<LoginResponse>);
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

  static async register(req: Request, res: Response): Promise<void> {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        role = UserRole.TOURIST,
      } = req.body;

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        res.status(409).json({
          success: false,
          message: "User already exists",
        } as ApiResponse);
        return;
      }

      // Create new user
      const newUser = await UserModel.create({
        email,
        password,
        firstName,
        lastName,
        role,
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = newUser;

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: userWithoutPassword,
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

  static async getProfile(
    req: Request & { user?: any },
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.userId;

      const user = await UserModel.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        } as ApiResponse);
        return;
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      // If user is a tourist, also get tourist profile
      if (user.role === UserRole.TOURIST) {
        const touristProfile = await TouristModel.findByUserId(userId);
        res.json({
          success: true,
          message: "Profile retrieved successfully",
          data: {
            user: userWithoutPassword,
            touristProfile,
          },
        } as ApiResponse);
      } else {
        res.json({
          success: true,
          message: "Profile retrieved successfully",
          data: { user: userWithoutPassword },
        } as ApiResponse);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
      } as ApiResponse);
    }
  }
}
