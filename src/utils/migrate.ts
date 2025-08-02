import { db } from "../config/database";
import * as bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const createTables = async (): Promise<void> => {
  try {
    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('employee', 'tourist') NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create tourists table
    await db.query(`
      CREATE TABLE IF NOT EXISTS tourists (
        id VARCHAR(36) PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        date_of_birth DATE NOT NULL,
        nationality VARCHAR(100) NOT NULL,
        passport_number VARCHAR(50),
        emergency_contact JSON,
        user_id VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_user_id (user_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create trips table
    await db.query(`
      CREATE TABLE IF NOT EXISTS trips (
        id VARCHAR(36) PRIMARY KEY,
        tourist_id VARCHAR(36) NOT NULL,
        tanggal_mulai_perjalanan DATETIME NOT NULL,
        tanggal_berakhir_perjalanan DATETIME NOT NULL,
        destinasi_perjalanan JSON NOT NULL,
        status ENUM('planned', 'ongoing', 'completed', 'cancelled') DEFAULT 'planned',
        total_cost DECIMAL(10,2),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_tourist_id (tourist_id),
        INDEX idx_status (status),
        INDEX idx_dates (tanggal_mulai_perjalanan, tanggal_berakhir_perjalanan),
        FOREIGN KEY (tourist_id) REFERENCES tourists(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log("Database tables created successfully!");
  } catch (error) {
    console.error("Error creating tables:", error);
    throw error;
  }
};

const seedDefaultData = async (): Promise<void> => {
  try {
    // Create default employee account
    const bcrypt = await import("bcryptjs");
    const { v4: uuidv4 } = await import("uuid");

    const hashedPassword = await bcrypt.hash("admin123", 10);
    const employeeId = uuidv4();

    await db.query(
      `
      INSERT IGNORE INTO users (id, email, password, role, first_name, last_name)
      VALUES (?, ?, ?, 'employee', 'Admin', 'Employee')
    `,
      [employeeId, "admin@mlaku-mulu.com", hashedPassword]
    );

    console.log("Default employee account created!");
    console.log("Email: admin@mlaku-mulu.com");
    console.log("Password: admin123");
  } catch (error) {
    console.error("Error seeding data:", error);
    throw error;
  }
};

const runMigrations = async (): Promise<void> => {
  try {
    console.log("Running database migrations...");

    // Test database connection
    const isConnected = await db.testConnection();
    if (!isConnected) {
      throw new Error("Database connection failed");
    }

    await createTables();
    await seedDefaultDataNew();

    console.log("Migrations completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

const seedDefaultDataNew = async (): Promise<void> => {
  try {
    console.log("Seeding dummy data...");

    // --- Create employee user ---
    const employeeId = uuidv4();
    const employeeEmail = "admin@mlaku-mulu.com";
    const employeePassword = await bcrypt.hash("admin123", 10);

    await db.query(
      `
      INSERT IGNORE INTO users 
      (id, email, password, role, first_name, last_name)
      VALUES (?, ?, ?, 'employee', 'Admin', 'Employee')
      `,
      [employeeId, employeeEmail, employeePassword]
    );

    // --- Create some tourist users ---
    const touristPassword = await bcrypt.hash("tourist123", 10);
    const tourists = [
      {
        id: uuidv4(),
        email: "johndoe@example.com",
        password: touristPassword,
        first_name: "John",
        last_name: "Doe",
      },
      {
        id: uuidv4(),
        email: "janedoe@example.com",
        password: touristPassword,
        first_name: "Jane",
        last_name: "Doe",
      },
    ];

    for (const t of tourists) {
      await db.query(
        `INSERT IGNORE INTO users (id, email, password, role, first_name, last_name)
        VALUES (?, ?, ?, 'tourist', ?, ?)`,
        [t.id, t.email, t.password, t.first_name, t.last_name]
      );
    }

    // --- Create Tourist profiles (tourists table) ---
    const touristProfiles = [
      {
        id: uuidv4(),
        first_name: "John",
        last_name: "Doe",
        email: "johndoe@example.com",
        phone: "081234567890",
        date_of_birth: "1985-06-15",
        nationality: "Indonesia",
        passport_number: "A1234567",
        emergency_contact: JSON.stringify([
          { name: "Jane Doe", phone: "081298765432", relation: "Wife" },
        ]),
        user_id: tourists[0]!.id,
      },
      {
        id: uuidv4(),
        first_name: "Jane",
        last_name: "Doe",
        email: "janedoe@example.com",
        phone: "081345678901",
        date_of_birth: "1990-09-20",
        nationality: "Indonesia",
        passport_number: "B7654321",
        emergency_contact: JSON.stringify([
          { name: "John Doe", phone: "081234567890", relation: "Husband" },
        ]),
        user_id: tourists[1]!.id,
      },
    ];

    for (const p of touristProfiles) {
      await db.query(
        `INSERT IGNORE INTO tourists
        (id, first_name, last_name, email, phone, date_of_birth, nationality, passport_number, emergency_contact, user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.id,
          p.first_name,
          p.last_name,
          p.email,
          p.phone,
          p.date_of_birth,
          p.nationality,
          p.passport_number,
          p.emergency_contact,
          p.user_id,
        ]
      );
    }

    // --- Create Trips ---
    const trips = [
      {
        id: uuidv4(),
        tourist_id: touristProfiles[0]!.id,
        tanggal_mulai_perjalanan: new Date("2025-08-10T08:00:00Z"),
        tanggal_berakhir_perjalanan: new Date("2025-08-20T18:00:00Z"),
        destinasi_perjalanan: JSON.stringify({
          name: "Bali",
          coordinates: { latitude: -8.3405, longitude: 115.092 },
          additionalInfo: "Beach vacation",
        }),
        status: "planned",
        total_cost: 15000000,
        notes: "Bring sunscreen",
      },
      {
        id: uuidv4(),
        tourist_id: touristProfiles[1]!.id,
        tanggal_mulai_perjalanan: new Date("2025-09-05T09:00:00Z"),
        tanggal_berakhir_perjalanan: new Date("2025-09-15T20:00:00Z"),
        destinasi_perjalanan: JSON.stringify({
          name: "Yogyakarta",
          coordinates: { latitude: -7.7956, longitude: 110.3695 },
          additionalInfo: "Cultural tour",
        }),
        status: "planned",
        total_cost: 10000000,
        notes: "Visit Prambanan temple",
      },
    ];

    for (const t of trips) {
      await db.query(
        `INSERT IGNORE INTO trips
        (id, tourist_id, tanggal_mulai_perjalanan, tanggal_berakhir_perjalanan, destinasi_perjalanan, status, total_cost, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          t.id,
          t.tourist_id,
          t.tanggal_mulai_perjalanan,
          t.tanggal_berakhir_perjalanan,
          t.destinasi_perjalanan,
          t.status,
          t.total_cost,
          t.notes,
        ]
      );
    }

    console.log("Dummy data seeded successfully!");
  } catch (error) {
    console.error("Error seeding dummy data", error);
    throw error;
  }
};

runMigrations();
