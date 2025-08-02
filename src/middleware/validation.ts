import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types/index";

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);

    if (error) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: error?.details[0]?.message || null,
      } as ApiResponse);
      return;
    }

    next();
  };
};

// Validation schemas
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const createTouristSchema = Joi.object({
  firstName: Joi.string().min(1).max(100).required(),
  lastName: Joi.string().min(1).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().optional(),
  dateOfBirth: Joi.string().isoDate().required(),
  nationality: Joi.string().min(1).max(100).required(),
  passportNumber: Joi.string().optional(),
  emergencyContact: Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().required(),
    relationship: Joi.string().required(),
  }).optional(),
});

export const updateTouristSchema = Joi.object({
  firstName: Joi.string().min(1).max(100).optional(),
  lastName: Joi.string().min(1).max(100).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
  dateOfBirth: Joi.string().isoDate().optional(),
  nationality: Joi.string().min(1).max(100).optional(),
  passportNumber: Joi.string().optional(),
  emergencyContact: Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().required(),
    relationship: Joi.string().required(),
  }).optional(),
});

export const createTripSchema = Joi.object({
  touristId: Joi.string().uuid().required(),
  tanggalMulaiPerjalanan: Joi.string().isoDate().required(),
  tanggalBerakhirPerjalanan: Joi.string().isoDate().required(),
  destinasiPerjalanan: Joi.object({
    name: Joi.string().required(),
    country: Joi.string().required(),
    city: Joi.string().required(),
    address: Joi.string().optional(),
    coordinates: Joi.object({
      latitude: Joi.number().min(-90).max(90).optional(),
      longitude: Joi.number().min(-180).max(180).optional(),
    }).optional(),
  }).required(),
  totalCost: Joi.number().min(0).optional(),
  notes: Joi.string().optional(),
});

export const updateTripSchema = Joi.object({
  tanggalMulaiPerjalanan: Joi.string().isoDate().optional(),
  tanggalBerakhirPerjalanan: Joi.string().isoDate().optional(),
  destinasiPerjalanan: Joi.object({
    name: Joi.string().required(),
    country: Joi.string().required(),
    city: Joi.string().required(),
    address: Joi.string().optional(),
    coordinates: Joi.object({
      latitude: Joi.number().min(-90).max(90).optional(),
      longitude: Joi.number().min(-180).max(180).optional(),
    }).optional(),
  }).optional(),
  status: Joi.string()
    .valid("planned", "ongoing", "completed", "cancelled")
    .optional(),
  totalCost: Joi.number().min(0).optional(),
  notes: Joi.string().optional(),
});
