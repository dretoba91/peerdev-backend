
import dotenv from 'dotenv';
import express from 'express';
import { Request, Response } from 'express';
import pool from './config/db';

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


// Start server after DB connects

async function startServer() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Connected to MySQL");
    connection.release();

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (err: any) {
    console.error("❌ Failed to connect to DB:", err.message);
    process.exit(1);
  }
}

startServer();