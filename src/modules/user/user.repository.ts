// userModel.ts

import pool from "../../config/db";
import { v4 as uuidv4 } from "uuid";
import type { User } from "./user.types";

export const userModel = {
  // Method to create a new user and assign roles
  async create(user: User) {
    const { first_name, last_name, email, password, experience_level, role_id } = user;
    const userUuid = user.id || uuidv4();

    // Use a transaction to ensure both user and role creation are atomic
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 1. Insert the new user into the users table
      await connection.execute(
        `INSERT INTO users (id, first_name, last_name, email, password, experience_level, role_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userUuid, first_name, last_name, email, password, experience_level, role_id]
      );

      await connection.commit();
      return { id: userUuid };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Method to find all users with their associated roles

  async findAll(limit: number, offset: number): Promise<{ users: User[], total: number }> {
    const [userData, countResult] = await Promise.all([
      pool.execute(
      `SELECT u.*, r.name AS role_name
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       LIMIT ? OFFSET ?`,
       [limit, offset]
    ),
    pool.execute(`SELECT COUNT(*) as total FROM users`, [])
    ]) as [[User[], any], [{ total: number }[], any]];

    const rows = userData[0] as User[];
    const total = countResult[0][0].total;
    
    return { users: rows, total: total };
  },

  // Method to find a user by their ID with all their roles

  async findById(id: string) {
    const [rows] = await pool.execute(
      `SELECT u.*, r.name AS role_name
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,

      [id]
    );
    return (rows as User[])[0] || null;
  },
  

  // Method to find a user by their email with all their roles
  async findByEmail(email: string) {
    const [rows] = await pool.execute(
      `SELECT u.*, r.name AS role_name
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.email = ?`,

      [email]
    );

    return (rows as User[])[0] || null;
  },

  // Flexible partial update — only updates fields you pass in
  async update(id: string, fields: Partial<User>) {
    const allowed: (keyof User)[] = [
      "first_name",
      "last_name",
      "email",
      "username",
      "profile_picture",
      "bio",
      "location",
      "github_url",
      "linkedin_url",
      "portfolio_url",
      "experience_level",
      "role_id",
      "is_active",
      "last_login",
      "email_verified",
      "verification_token",
      "verification_token_expires",
    ];

    // Build SET clause dynamically from only the fields passed in
    const updates = Object.keys(fields)
      .filter((key) => allowed.includes(key as keyof User))
      .map((key) => `${key} = ?`);

    if (updates.length === 0) return;

    const values = Object.keys(fields)
      .filter((key) => allowed.includes(key as keyof User))
      .map((key) => (fields as any)[key]);

    await pool.execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      [...values, id]
    );
  },

  // Method to delete a user and their associated roles via CASCADE
  // Delete user — CASCADE handles related records
  async deleteUser(id: string) {
    const [result] = await pool.execute(
      `DELETE FROM users WHERE id = ?`, [id]
    );
    return result;
  },
};