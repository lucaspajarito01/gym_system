import pool from '../config/database.js';

export class NutritionRepository {
    async createPlan(data) {
        const query = `
            INSERT INTO planes_nutricion (cliente_id, plan_entrenamiento_id, nombre_dieta) 
            VALUES (?, ?, ?)
        `;
        const [result] = await pool.query(query, [
            data.cliente_id,
            data.plan_entrenamiento_id, // Corregido a singular tal como está en la BD
            data.nombre_dieta
        ]);
        return { id: result.insertId, ...data };
    }

    async findPlanesByCliente(clienteId) {
        const [rows] = await pool.query(`
            SELECT pn.id, pn.nombre_dieta, pe.nombre AS plan_entrenamiento 
            FROM planes_nutricion pn
            JOIN plan_entrenamientos pe ON pn.plan_entrenamiento_id = pe.id
            WHERE pn.cliente_id = ?
        `, [clienteId]);
        return rows;
    }

    async addAlimento(data) {
        const query = `
            INSERT INTO alimentos_diarios (plan_nutricion_id, fecha, nombre_alimento, calorias_estimadas) 
            VALUES (?, ?, ?, ?)
        `;
        await pool.query(query, [
            data.plan_nutricion_id,
            data.fecha,
            data.nombre_alimento,
            data.calorias_estimadas
        ]);
        return data;
    }

    async findAlimentosByPlan(planNutricionId) {
        const [rows] = await pool.query(`
            SELECT id, fecha, nombre_alimento, calorias_estimadas 
            FROM alimentos_diarios 
            WHERE plan_nutricion_id = ? 
            ORDER BY fecha DESC
        `, [planNutricionId]);
        return rows;
    }
}