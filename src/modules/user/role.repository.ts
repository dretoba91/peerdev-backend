import pool from "../../config/db";
import { v4 as uuidv4 } from "uuid";
import type { Role } from "./user.types";

export const RoleModel = {
  // create
  async create(role: Role) {
    const { name, description } = role;
    const roleUuid = role.id || uuidv4();

    const [result] = await pool.execute(
      `INSERT INTO roles (id, name, description) VALUES (?, ?, ?)`,
      [roleUuid, name, description]
    );

    return result;
  },

  // select all

  async findAll() {
    const [result] = await pool.execute(`SELECT * FROM roles`);
    return result;
  },

  // find by Id (UUID primary key)
  async findById(id: string) {
    const [result] = await pool.execute(`SELECT * FROM roles WHERE id = ?`, [
      id,
    ]);
    return (result as Role[])[0] || null;
  },
  

  // find by Name
  async findByName(name: string) {
    const [result] = await pool.execute(`SELECT * FROM roles WHERE name = ?`, [
      name,
    ]);
    return (result as Role[])[0] || null;
  },
};