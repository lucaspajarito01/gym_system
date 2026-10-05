import pool from '../config/database.js';

export class PlanRepository {
    async create(planData) {
        const query = 'INSERT INTO plan_entrenamientos (nombre, duracion, metas_fisicas, nivel) VALUES (?, ?, ?, ?)';
        await pool.query(query, [
            planData.nombre,
            planData.duracion,
            planData.metas_fisicas,
            planData.nivel
        ]);
        return planData;
    }

    async findAll() {
        const [rows] = await pool.query('SELECT * FROM plan_entrenamientos');
        return rows;
    }

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM plan_entrenamientos WHERE id = ?', [id]);
        return rows[0] || null;
    }

    async update(id, planData) {
        const query = 'UPDATE plan_entrenamientos SET nombre = ?, duracion = ?, metas_fisicas = ?, nivel = ? WHERE id = ?';
        await pool.query(query, [
            planData.nombre,
            planData.duracion,
            planData.metas_fisicas,
            planData.nivel,
            id
        ]);
        return planData;
    }

    async delete(id, connection = pool) {
        await connection.query('DELETE FROM plan_entrenamientos WHERE id = ?', [id]);
    }
}