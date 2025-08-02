import { v4 as uuidv4 } from "uuid";
import { db } from "../config/database";
import {
  Trip,
  TripStatus,
  CreateTripRequest,
  UpdateTripRequest,
} from "../types/index";
import { AppError } from "../middleware/error";

export class TripModel {
  static async findAll(): Promise<Trip[]> {
    try {
      const trips = await db.query(
        "SELECT * FROM trips ORDER BY created_at DESC"
      );
      return trips.map(this.mapDatabaseToTrip);
    } catch (error) {
      throw new AppError("Error fetching trips", 500);
    }
  }

  static async findById(id: string): Promise<Trip | null> {
    try {
      const trips = await db.query("SELECT * FROM trips WHERE id = ?", [id]);

      if (trips.length === 0) return null;

      return this.mapDatabaseToTrip(trips[0]);
    } catch (error) {
      throw new AppError("Error finding trip", 500);
    }
  }

  static async findByTouristId(touristId: string): Promise<Trip[]> {
    try {
      const trips = await db.query(
        "SELECT * FROM trips WHERE tourist_id = ? ORDER BY tanggal_mulai_perjalanan DESC",
        [touristId]
      );

      return trips.map(this.mapDatabaseToTrip);
    } catch (error) {
      throw new AppError("Error finding trips for tourist", 500);
    }
  }

  static async create(tripData: CreateTripRequest): Promise<Trip> {
    try {
      const id = uuidv4();

      // Validate dates
      const startDate = new Date(tripData.tanggalMulaiPerjalanan);
      const endDate = new Date(tripData.tanggalBerakhirPerjalanan);

      if (startDate >= endDate) {
        throw new AppError("Start date must be before end date", 400);
      }

      await db.query(
        `INSERT INTO trips (id, tourist_id, tanggal_mulai_perjalanan, tanggal_berakhir_perjalanan,
         destinasi_perjalanan, total_cost, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          tripData.touristId,
          startDate,
          endDate,
          JSON.stringify(tripData.destinasiPerjalanan),
          tripData.totalCost || null,
          tripData.notes || null,
        ]
      );

      const newTrip = await this.findById(id);
      if (!newTrip) {
        throw new AppError("Failed to create trip", 500);
      }

      return newTrip;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Error creating trip", 500);
    }
  }

  static async update(
    id: string,
    updateData: UpdateTripRequest
  ): Promise<Trip | null> {
    try {
      const fields: string[] = [];
      const values: any[] = [];

      if (updateData.tanggalMulaiPerjalanan !== undefined) {
        fields.push("tanggal_mulai_perjalanan = ?");
        values.push(new Date(updateData.tanggalMulaiPerjalanan));
      }
      if (updateData.tanggalBerakhirPerjalanan !== undefined) {
        fields.push("tanggal_berakhir_perjalanan = ?");
        values.push(new Date(updateData.tanggalBerakhirPerjalanan));
      }
      if (updateData.destinasiPerjalanan !== undefined) {
        fields.push("destinasi_perjalanan = ?");
        values.push(JSON.stringify(updateData.destinasiPerjalanan));
      }
      if (updateData.status !== undefined) {
        fields.push("status = ?");
        values.push(updateData.status);
      }
      if (updateData.totalCost !== undefined) {
        fields.push("total_cost = ?");
        values.push(updateData.totalCost);
      }
      if (updateData.notes !== undefined) {
        fields.push("notes = ?");
        values.push(updateData.notes);
      }

      if (fields.length === 0) {
        return this.findById(id);
      }

      values.push(id);

      await db.query(
        `UPDATE trips SET ${fields.join(
          ", "
        )}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      );

      return this.findById(id);
    } catch (error) {
      throw new AppError("Error updating trip", 500);
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      const result = await db.query("DELETE FROM trips WHERE id = ?", [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new AppError("Error deleting trip", 500);
    }
  }

  static async findUpcomingTrips(): Promise<Trip[]> {
    try {
      const trips = await db.query(
        `SELECT * FROM trips 
         WHERE tanggal_mulai_perjalanan > NOW() AND status IN ('planned', 'ongoing')
         ORDER BY tanggal_mulai_perjalanan ASC`
      );

      return trips.map(this.mapDatabaseToTrip);
    } catch (error) {
      throw new AppError("Error fetching upcoming trips", 500);
    }
  }

  static async findTripsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<Trip[]> {
    try {
      const trips = await db.query(
        `SELECT * FROM trips 
         WHERE tanggal_mulai_perjalanan >= ? AND tanggal_berakhir_perjalanan <= ?
         ORDER BY tanggal_mulai_perjalanan ASC`,
        [startDate, endDate]
      );

      return trips.map(this.mapDatabaseToTrip);
    } catch (error) {
      throw new AppError("Error fetching trips by date range", 500);
    }
  }

  private static mapDatabaseToTrip(dbTrip: any): Trip {
    return {
      id: dbTrip.id,
      touristId: dbTrip.tourist_id,
      tanggalMulaiPerjalanan: new Date(dbTrip.tanggal_mulai_perjalanan),
      tanggalBerakhirPerjalanan: new Date(dbTrip.tanggal_berakhir_perjalanan),
      destinasiPerjalanan: JSON.parse(dbTrip.destinasi_perjalanan),
      status: dbTrip.status as TripStatus,
      totalCost: dbTrip.total_cost,
      notes: dbTrip.notes,
      createdAt: new Date(dbTrip.created_at),
      updatedAt: new Date(dbTrip.updated_at),
    };
  }
}
