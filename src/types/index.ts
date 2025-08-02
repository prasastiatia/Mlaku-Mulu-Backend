export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  EMPLOYEE = "employee",
  TOURIST = "tourist",
}

export interface Tourist {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth: Date;
  nationality: string;
  passportNumber?: string;
  emergencyContact?: EmergencyContact;
  createdAt: Date;
  updatedAt: Date;
  userId?: string; // Link to User account if tourist has account
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface Trip {
  id: string;
  touristId: string;
  tanggalMulaiPerjalanan: Date; // Start date with time in UTC
  tanggalBerakhirPerjalanan: Date; // End date with time in UTC
  destinasiPerjalanan: Destination; // Can be string or object
  status: TripStatus;
  totalCost?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Destination {
  name: string;
  country: string;
  city: string;
  address?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export enum TripStatus {
  PLANNED = "planned",
  ONGOING = "ongoing",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: Omit<User, "password">;
  token: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Request Types
export interface CreateTouristRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber?: string;
  emergencyContact?: EmergencyContact;
}

export interface UpdateTouristRequest extends Partial<CreateTouristRequest> {}

export interface CreateTripRequest {
  touristId: string;
  tanggalMulaiPerjalanan: string;
  tanggalBerakhirPerjalanan: string;
  destinasiPerjalanan: Destination;
  totalCost?: number;
  notes?: string;
}

export interface UpdateTripRequest
  extends Partial<Omit<CreateTripRequest, "touristId">> {
  status?: TripStatus;
}

// Database Result Types
export interface DatabaseResult {
  affectedRows: number;
  insertId?: number;
  changedRows?: number;
}
