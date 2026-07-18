/*
 * Session Repository
 * This module provides an interface for managing user sessions in the authentication system.
 * It includes methods for creating, retrieving, and deleting sessions, as well as handling refresh tokens.
 * methods:
 * - createSession: Creates a new session for a user with a refresh token.
 * - getSessionById: Retrieves a session based on its ID.
 * - deleteSession: Deletes a session by its ID.
 * - deleteSessionsByUserId: Deletes all sessions associated with a specific user ID.
 * - updateSessionRefreshToken: Updates the refresh token for an existing session (used after initial session creation).
 */

import pool from "../../config/db";
import { UserSession } from "./session.types";

export const sessionRepository = {
  async createSession(session: UserSession): Promise<void> {
    const { id, user_id, refresh_token, device_id, ip_address } = session;
    await pool.execute(
      `INSERT INTO user_sessions (id, user_id, refresh_token, device_id, ip_address) VALUES (?, ?, ?, ?, ?)`,
      [id, user_id, refresh_token, device_id || null, ip_address || null],
    );
  },

  async getSessionById(sessionId: string): Promise<UserSession | null> {
    const [rows] = await pool.execute(
      `SELECT * FROM user_sessions WHERE id = ?`,
      [sessionId],
    );
    return (rows as UserSession[])[0] || null;
  },

  async findAllByUserId(userId: string): Promise<UserSession[]> {
    const [rows] = await pool.execute(
      `SELECT * FROM user_sessions WHERE user_id = ?`,
      [userId],
    );
    return rows as UserSession[];
  },

  async deleteSession(sessionId: string): Promise<void> {
    await pool.execute(`DELETE FROM user_sessions WHERE id = ?`, [sessionId]);
  },

  async deleteSessionsByUserId(userId: string): Promise<void> {
    await pool.execute(`DELETE FROM user_sessions WHERE user_id = ?`, [userId]);
  },

  async updateSessionRefreshToken(
    sessionId: string,
    newRefreshToken: string,
  ): Promise<void> {
    await pool.execute(
      `UPDATE user_sessions SET refresh_token = ? WHERE id = ?`,
      [newRefreshToken, sessionId],
    );
  },
};
