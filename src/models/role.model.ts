import pool from "../config/db";



export interface Role {
    id?: number;
    name: string;
    description?: string;
    created_at?: Date;
    updated_at?: Date;
}

export const RoleModel = {
    // create

    async create(role: Role) {
        const {name, description} = role;
        const [result] = await pool.execute(
            `INSERT INTO roles (name, description) VALUES (?, ?)`, [name, description]
        );

        return result;
    },

    // select all

    async findAll() {
        const [result] = await pool.execute(
            `SELECT * FROM roles`
        );
        return result;
    },

    // find by Id

    async findById(id: number) {
        const [result] = await pool.execute(
            `SELECT * FROM roles WHERE id = ?`, [id]
        );
        return (result as Role[])[0] || null;
    },

    // find by Name

    async findByName(name: string) {
        const [result] = await pool.execute(
            `SELECT * FROM roles WHERE name = ?`, [name]
        );

        return (result as Role[])[0] || null;
    }
}