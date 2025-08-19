import fs from "fs";
import path from "path";
import pool from "../config/db";

async function runMigrations() {
  const migrationsDir = path.join(__dirname, "../migrations");

  const files = fs.readdirSync(migrationsDir).filter(file => file.endsWith(".sql"));

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, "utf-8");

    console.log(`Running migration: ${file}`);
    await pool.query(sql);
    console.log(`✅ Migration ${file} completed.`);
  }

  await pool.end();
}

runMigrations().catch(err => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
