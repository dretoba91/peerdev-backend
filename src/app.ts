
import dotenv from 'dotenv';
import express from 'express';
import { Request, Response } from "express";
import pool from "./config/db";
import { notFoundHandler, errorHandler } from "./shared/middleware/errorHandler";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/user/user.routes";
import { specs, swaggerUi } from "./config/swagger";
import redis from './config/redis';
import { logger } from './shared/utils/loggers';

// Load environment variables from .env file
dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware to parse JSON bodies
app.use(express.json());

// Health check
app.get("/", (_req: Request, res: Response) => {
  res.send("PeerDev API is running...");
});

// API Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "PeerDev API Documentation",
  })
);

// API routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Start server after DB connects

async function startServer() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Connected to MySQL");
    connection.release();

    // Verify Redis
    await redis.ping();
    logger.info('✅ Connected to Redis');


    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (err: any) {
    console.error("❌ Failed to connect to DB:", err.message);
    process.exit(1);
  }
}

startServer();