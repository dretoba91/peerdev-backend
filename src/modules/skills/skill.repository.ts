/*
1. Admin create skills
2. Users search for skills to pick.
 */

import pool from "../../config/db";
import { Skill } from "./skill.type";

export const SkillRepository = {
  // create a new skill
  async create(skill: Skill): Promise<void> {
    const { name } = skill;

    await pool.execute(`INSERT INTO skills (name) VALUES (?)`, [name]);
  },

  // find all skills

  async findAll(
    limit: number,
    offset: number,
  ): Promise<{ skills: Skill[]; total: number }> {
    const [skillsData, countResult] = (await Promise.all([
      pool.execute(
        `SELECT * FROM skills
            LIMIT ? OFFSET ?`,
        [limit, offset],
      ),
      pool.execute(`SELECT COUNT(*) as total FROM skills`, []),
    ])) as [[Skill[], any], [{ total: number }[], any]];

    const rows = skillsData[0];
    const total = countResult[0][0].total;

    return { skills: rows, total: total };
  },

  // get skills by name search
  async findByName(
    name: string,
    limit: number,
    offset: number,
  ): Promise<{ skills: Skill[]; total: number }> {
    const [skills, count] = (await Promise.all([
      pool.execute(
        `SELECT * FROM skills WHERE name LIKE ?
        LIMIT ? OFFSET ?`,
        [`%${name}%`,limit, offset],
      ),
      pool.execute(`SELECT COUNT(*) as total FROM skills WHERE name LIKE ?`, [
        `%${name}%`,
      ]),
    ])) as [[Skill[], any], [{ total: number }[], any]];

    const rows = skills[0];
    const total = count[0][0].total;
    return { skills: rows, total: total };
  },

  // get exact skill by name
  async findExact(name: string): Promise<Skill | null> {
    const [rows] = await pool.execute(
      `SELECT * FROM skills WHERE LOWER(name) = LOWER(?)`,
      [name],
    );
    return (rows as Skill[])[0] || null;
  },
};
