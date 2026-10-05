import pool from '../config/database.js';

export class ContractRepository {
    async create(contractData, connection = pool) {
        const query = `
            INSERT INTO contratos (cliente_id, plan_id, fecha_inicio, fecha_fin, condiciones, estado) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        await connection.query(query, [
            contractData.cliente_id,
            contractData.plan_id,
            contractData.fecha_inicio,
            contractData.fecha_fin,
            contractData.condiciones || 'Términos y condiciones estándar del gimnasio.',
            contractData.estado || 'activo'
        ]);
        return contractData;
    }

    async findByClienteId(clienteId) {
        const [rows] = await pool.query(`
            SELECT co.id, co.plan_id, p.nombre AS plan_nombre, co.fecha_inicio, co.fecha_fin, co.condiciones, co.estado
            FROM contratos co
            JOIN plan_entrenamientos p ON co.plan_id = p.id
            WHERE co.cliente_id = ?
        `, [clienteId]);
        return rows;
    }

    async findByClienteAndPlan(clienteId, planId, connection = pool) {
        const [rows] = await connection.query(
            'SELECT id FROM contratos WHERE cliente_id = ? AND plan_id = ? LIMIT 1',
            [clienteId, planId]
        );
        return rows[0] || null;
    }

    async deleteByClienteAndPlan(clienteId, planId, connection = pool) {
        const [result] = await connection.query(
            'DELETE FROM contratos WHERE cliente_id = ? AND plan_id = ?',
            [clienteId, planId]
        );
        return result.affectedRows;
    }

    async deleteByPlan(planId, connection = pool) {
        await connection.query('DELETE FROM contratos WHERE plan_id = ?', [planId]);
    }

    async obtenerContratoPorClienteId(clienteId) {
        const [rows] = await pool.query(
            `SELECT c.id, c.cliente_id, c.plan_id, c.condiciones, c.precio, c.fecha_inicio, c.fecha_fin, c.estado, p.nombre AS plan_nombre
             FROM contratos c
             JOIN plan_entrenamientos p ON c.plan_id = p.id
             WHERE c.cliente_id = ?`,
            [clienteId]
        );
        return rows;
    }
}