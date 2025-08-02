import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { db } from "../config/database";
import { User, UserRole } from "../types/index";
import { AppError } from "../middleware/error";

export class UserModel {
  static async findByEmail(email: string): Promise<User | null> {
    try {
      const users = await db.query("SELECT * FROM users WHERE email = ?", [
        email,
      ]);

      if (users.length === 0) return null;

      return this.mapDatabaseToUser(users[0]);
    } catch (error) {
      throw new AppError("Error finding user by email", 500);
    }
  }

  static async findById(id: string): Promise<User | null> {
    try {
      const users = await db.query("SELECT * FROM users WHERE id = ?", [id]);

      if (users.length === 0) return null;

      return this.mapDatabaseToUser(users[0]);
    } catch (error) {
      throw new AppError("Error finding user by ID", 500);
    }
  }

  static async create(
    userData: Omit<User, "id" | "createdAt" | "updatedAt">
  ): Promise<User> {
    try {
      const id = uuidv4();
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      await db.query(
        `INSERT INTO users (id, email, password, role, first_name, last_name)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          id,
          userData.email,
          hashedPassword,
          userData.role,
          userData.firstName,
          userData.lastName,
        ]
      );

      const newUser = await this.findById(id);
      if (!newUser) {
        throw new AppError("Failed to create user", 500);
      }

      return newUser;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Error creating user", 500);
    }
  }

  static async validatePassword(
    user: User,
    password: string
  ): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  private static mapDatabaseToUser(dbUser: any): User {
    return {
      id: dbUser.id,
      email: dbUser.email,
      password: dbUser.password,
      role: dbUser.role as UserRole,
      firstName: dbUser.first_name,
      lastName: dbUser.last_name,
      createdAt: new Date(dbUser.created_at),
      updatedAt: new Date(dbUser.updated_at),
    };
  }
}
