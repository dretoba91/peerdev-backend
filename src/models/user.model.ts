import pool from "../config/db";
import { v4 as uuidv4 } from "uuid";

export interface User {
  id?: string; // UUID primary key
  full_name: string;
  email: string;
  password: string;
  role_id?: string | null; // UUID foreign key to roles
  experience_level?: string;
  created_at?: Date;
  updated_at?: Date;
}

export const userModel = {
  // create
  async create(user: User) {
    const { full_name, email, password, role_id, experience_level } = user;
    const userUuid = user.id || uuidv4();

    const [result] = await pool.execute(
      `INSERT INTO users (id, full_name, email, password, role_id, experience_level) VALUES (?, ?, ?, ?, ?, ?)`,
      [userUuid, full_name, email, password, role_id, experience_level]
    );

    return result;
  },

  // find all
  async findAll() {
    const [result] = await pool.execute(`SELECT * FROM users`);

    return result;
  },

  // find by Id (UUID primary key)
  async findById(id: string) {
    const [result] = await pool.execute(`SELECT * FROM users WHERE id = ?`, [
      id,
    ]);

    return (result as User[])[0] || null;
  },

  // find by email

  async findByEmail(email: string) {
    const [result] = await pool.execute(`SELECT * FROM users WHERE email = ?`, [
      email,
    ]);
    return (result as User[])[0] || null;
  },

  // update user

  async updateUser(user: User) {
    const { id, full_name, email, password, role_id, experience_level } = user;
    const [result] = await pool.execute(
      `UPDATE users SET full_name = ?, email = ?, password = ?, role_id = ?, experience_level = ? WHERE id = ?`,
      [full_name, email, password, role_id, experience_level, id]
    );
  },

  // delete user
  async deleteUser(id: string) {
    const [result] = await pool.execute(`DELETE FROM users WHERE id = ?`, [id]);
    return result;
  },

  // update role
  async updateRole(userId: string, roleId: string | null) {
    const [result] = await pool.execute(
      `UPDATE users SET role_id = ? WHERE id = ?`,
      [roleId, userId]
    );
    return result;
  },
};