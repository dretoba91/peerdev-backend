// src/scripts/seed-roles.ts
import fs from "fs";
import path from "path";
import pool from "../config/db";

async function seedRoles() {
  const sqlPath = path.join(__dirname, "../seed/seed_roles.sql");
  const sql = fs.readFileSync(sqlPath, "utf-8");

  try {
    console.log("Seeding roles...");
    await pool.query(sql);
    console.log("✅ Roles seeded successfully.");
  } catch (err) {
    console.error("❌ Failed to seed roles:", err);
  } finally {
    await pool.end();
  }
}

seedRoles();
