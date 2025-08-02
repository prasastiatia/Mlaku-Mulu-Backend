import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "mlaku_mulu_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "+00:00", // Store dates in UTC
  dateStrings: false,
};

class Database {
  private static instance: Database;
  private pool: mysql.Pool;

  private constructor() {
    this.pool = mysql.createPool(dbConfig);
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public getPool(): mysql.Pool {
    return this.pool;
  }

  public async query(sql: string, values?: any[]): Promise<any> {
    try {
      const [rows] = await this.pool.execute(sql, values);
      return rows;
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  }

  public async beginTransaction(): Promise<mysql.PoolConnection> {
    const connection = await this.pool.getConnection();
    await connection.beginTransaction();
    return connection;
  }

  public async commitTransaction(
    connection: mysql.PoolConnection
  ): Promise<void> {
    await connection.commit();
    connection.release();
  }

  public async rollbackTransaction(
    connection: mysql.PoolConnection
  ): Promise<void> {
    await connection.rollback();
    connection.release();
  }

  public async testConnection(): Promise<boolean> {
    try {
      await this.pool.execute("SELECT 1");
      console.log("Database connection successful!");
      return true;
    } catch (error) {
      console.error("Database connection failed:", error);
      return false;
    }
  }
}

export const db = Database.getInstance();
