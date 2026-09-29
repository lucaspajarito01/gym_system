import pool from '../config/database.js';

export class ContractRepository {
    async create(contractData) {
        const query = `
            INSERT INTO contratos (cliente_id, plan_id, fecha_inicio, fecha_fin, condiciones, estado) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        await pool.query(query, [
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
            SELECT co.id, p.nombre AS plan_nombre, co.fecha_inicio, co.fecha_fin, co.condiciones, co.estado
            FROM contratos co
            JOIN plan_entrenamientos p ON co.plan_id = p.id
            WHERE co.cliente_id = ?
        `, [clienteId]);
        return rows;
    }
}