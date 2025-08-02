import { v4 as uuidv4 } from "uuid";
import { db } from "../config/database";
import {
  Tourist,
  CreateTouristRequest,
  UpdateTouristRequest,
} from "../types/index";
import { AppError } from "../middleware/error";

export class TouristModel {
  static async findAll(): Promise<Tourist[]> {
    try {
      const tourists = await db.query(
        "SELECT * FROM tourists ORDER BY created_at DESC"
      );
      return tourists.map(this.mapDatabaseToTourist);
    } catch (error) {
      throw new AppError("Error fetching tourists", 500);
    }
  }

  static async findById(id: string): Promise<Tourist | null> {
    try {
      const tourists = await db.query("SELECT * FROM tourists WHERE id = ?", [
        id,
      ]);

      if (tourists.length === 0) return null;

      return this.mapDatabaseToTourist(tourists[0]);
    } catch (error) {
      throw new AppError("Error finding tourist", 500);
    }
  }

  static async findByUserId(userId: string): Promise<Tourist | null> {
    try {
      const tourists = await db.query(
        "SELECT * FROM tourists WHERE user_id = ?",
        [userId]
      );

      if (tourists.length === 0) return null;

      return this.mapDatabaseToTourist(tourists[0]);
    } catch (error) {
      throw new AppError("Error finding tourist by user ID", 500);
    }
  }

  static async create(touristData: CreateTouristRequest): Promise<Tourist> {
    try {
      const id = uuidv4();

      await db.query(
        `INSERT INTO tourists (id, first_name, last_name, email, phone, date_of_birth, 
         nationality, passport_number, emergency_contact)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          touristData.firstName,
          touristData.lastName,
          touristData.email,
          touristData.phone || null,
          touristData.dateOfBirth,
          touristData.nationality,
          touristData.passportNumber || null,
          touristData.emergencyContact
            ? JSON.stringify(touristData.emergencyContact)
            : null,
        ]
      );

      const newTourist = await this.findById(id);
      if (!newTourist) {
        throw new AppError("Failed to create tourist", 500);
      }

      return newTourist;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Error creating tourist", 500);
    }
  }

  static async update(
    id: string,
    updateData: UpdateTouristRequest
  ): Promise<Tourist | null> {
    try {
      const fields: string[] = [];
      const values: any[] = [];

      if (updateData.firstName !== undefined) {
        fields.push("first_name = ?");
        values.push(updateData.firstName);
      }
      if (updateData.lastName !== undefined) {
        fields.push("last_name = ?");
        values.push(updateData.lastName);
      }
      if (updateData.email !== undefined) {
        fields.push("email = ?");
        values.push(updateData.email);
      }
      if (updateData.phone !== undefined) {
        fields.push("phone = ?");
        values.push(updateData.phone);
      }
      if (updateData.dateOfBirth !== undefined) {
        fields.push("date_of_birth = ?");
        values.push(updateData.dateOfBirth);
      }
      if (updateData.nationality !== undefined) {
        fields.push("nationality = ?");
        values.push(updateData.nationality);
      }
      if (updateData.passportNumber !== undefined) {
        fields.push("passport_number = ?");
        values.push(updateData.passportNumber);
      }
      if (updateData.emergencyContact !== undefined) {
        fields.push("emergency_contact = ?");
        values.push(JSON.stringify(updateData.emergencyContact));
      }

      if (fields.length === 0) {
        return this.findById(id);
      }

      values.push(id);

      await db.query(
        `UPDATE tourists SET ${fields.join(
          ", "
        )}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      );

      return this.findById(id);
    } catch (error) {
      throw new AppError("Error updating tourist", 500);
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      const result = await db.query("DELETE FROM tourists WHERE id = ?", [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new AppError("Error deleting tourist", 500);
    }
  }

  private static mapDatabaseToTourist(dbTourist: any): Tourist {
    return {
      id: dbTourist.id,
      firstName: dbTourist.first_name,
      lastName: dbTourist.last_name,
      email: dbTourist.email,
      phone: dbTourist.phone,
      dateOfBirth: new Date(dbTourist.date_of_birth),
      nationality: dbTourist.nationality,
      passportNumber: dbTourist.passport_number,
      emergencyContact: dbTourist.emergency_contact
        ? JSON.parse(dbTourist.emergency_contact)
        : undefined,
      userId: dbTourist.user_id,
      createdAt: new Date(dbTourist.created_at),
      updatedAt: new Date(dbTourist.updated_at),
    };
  }
}
