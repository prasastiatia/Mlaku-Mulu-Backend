import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import routes from "./routes";
import { db } from "./config/database";
import { errorHandler, notFound } from "./middleware/error";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://your-frontend-domain.com"]
        : [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:5173",
          ],
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// API routes
app.use("/api", routes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Mlaku-Mulu Travel Agency API",
    version: "1.0.0",
    documentation: "/api/docs",
    endpoints: {
      auth: "/api/auth",
      tourists: "/api/tourists",
      trips: "/api/trips",
      health: "/api/health",
    },
  });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Database connection and server startup
const startServer = async (): Promise<void> => {
  try {
    // Test database connection
    const isConnected = await db.testConnection();
    if (!isConnected) {
      console.error("Failed to connect to database");
      process.exit(1);
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`\n🚀 Mlaku-Mulu Backend Server is running!`);
      console.log(`📍 Server: http://localhost:${PORT}`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`📦 Database: ${process.env.DB_NAME || "mlaku_mulu_db"}`);
      console.log("\n📊 Available Endpoints:");
      console.log("   POST   /api/auth/login");
      console.log("   POST   /api/auth/register");
      console.log("   GET    /api/auth/profile");
      console.log("   GET    /api/tourists");
      console.log("   POST   /api/tourists");
      console.log("   GET    /api/tourists/:id");
      console.log("   PUT    /api/tourists/:id");
      console.log("   DELETE /api/tourists/:id");
      console.log("   GET    /api/trips");
      console.log("   GET    /api/trips/my");
      console.log("   GET    /api/trips/upcoming");
      console.log("   POST   /api/trips");
      console.log("   GET    /api/trips/:id");
      console.log("   PUT    /api/trips/:id");
      console.log("   DELETE /api/trips/:id");
      console.log("   GET    /api/trips/tourist/:touristId");
      console.log("\n⚡ Ready to accept requests!\n");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("\n🛑 SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("\n🛑 SIGINT received. Shutting down gracefully...");
  process.exit(0);
});

// Start the server
startServer();

export default app;
