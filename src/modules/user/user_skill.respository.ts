import pool from "../../config/db";
import { Skill } from "../skills/skill.type";
import { User } from "./user.types";

/**
 * * UserSkillRepository is responsible for handling database operations related to user skills.
 * This are the database operations that will be carried out in this repository:

    - addUserSkill(userId: string, skillId: string): Promise<void>
    - removeUserSkill(userId: string, skillId: string): Promise<void>
    - getUserSkills(userId: string): Promise<Skill[]>
    - getUsersBySkill(skillId: string): Promise<User[]>
 */

export const UserSkillRepository = {
  // user add a skill
  async addUserSkill(userId: string, skillId: string): Promise<void> {
    await pool.execute(
      `INSERT INTO user_skills (user_id, skill_id) VALUES (?, ?)`,
      [userId, skillId],
    );
  },

  // user remove a skill
  async removeUserSkill(userId: string, skillId: string): Promise<void> {
    await pool.execute(
      `DELETE FROM user_skills WHERE user_id = ? AND skill_id = ?`,
      [userId, skillId],
    );
  },

  // get all skills of a user
  async getUserSkills(userId: string): Promise<Skill[]> {
    const [rows] = await pool.execute(
      `SELECT s.id, s.name, s.created_at FROM skills s
             JOIN user_skills us ON s.id = us.skill_id
             WHERE us.user_id = ?`,
      [userId],
    );
    return rows as Skill[];
  },

  // get any user by their skill
  async getUsersBySkill(skillId: string, limit: number, offset: number): Promise<{users: User[], total: number}> {
    const [userData, countResult] = await Promise.all([
        pool.execute(
      `SELECT u.id, u.first_name, u.last_name, u.username, u.experience_level FROM users u
             JOIN user_skills us ON u.id = us.user_id
             WHERE us.skill_id = ?
             LIMIT ? OFFSET ?`,

      [skillId, limit, offset],
    ),
    pool.execute(
        `SELECT COUNT(*) as total FROM users u
             JOIN user_skills us ON u.id = us.user_id
             WHERE us.skill_id = ?`, [skillId]
    )
    ]) as [[User[], any], [{ total: number }[], any]];
    const rows = userData[0];
    const total = countResult[0][0].total;

    return {users: rows, total: total};
  },

  // check if user already has a skill
  async userHasSkill(userId: string, skillId: string): Promise<boolean> {
    const [rows] = await pool.execute(
      `SELECT EXISTS (
                    SELECT 1 FROM user_skills
                    WHERE user_id = ? AND skill_id = ?
        ) AS has_skill`,
      [userId, skillId],
    );
    return (rows as any)[0].has_skill === 1;
  }
};
