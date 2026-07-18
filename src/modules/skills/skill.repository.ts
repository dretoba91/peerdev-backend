/*
1. Admin create skills
2. Users search for skills to pick.
 */

import pool from "../../config/db";
import { Skill } from "./skill.type";

export const SkillRepository =  {
    // create a new skill
    async create(skill: Skill): Promise<void> {
        const { name } = skill;

        await pool.execute(
            `INSERT INTO skills (name) VALUES (?)`,
            [name]
        );
    },

    // find all skills

    async findAll(): Promise<Skill[]> {
        const [rows] = await pool.execute(
            `SELECT * FROM skills`
        );
        return rows as Skill[];
    },
        
    // get skills by name search
    async findByName(name: string): Promise<Skill[]> {
        const [rows] = await pool.execute(
            `SELECT * FROM skills WHERE name LIKE ?`,
            [`%${name}%`]
        );
        return rows as Skill[];
    },

    // get exact skill by name
    async findExact(name: string): Promise<Skill | null> {
    const [rows] = await pool.execute(
        `SELECT * FROM skills WHERE LOWER(name) = LOWER(?)`,
        [name]
    );
    return (rows as Skill[])[0] || null;
}
};