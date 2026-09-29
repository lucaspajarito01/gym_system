import pool from '../config/database.js';

export class SeguimientoRepository {
    async create(data) {
        const query = `
            INSERT INTO seguimiento_fisico (cliente_id, fecha_registro, peso, grasa_corporal, medidas_json, foto_ruta, comentarios) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        await pool.query(query, [
            data.cliente_id,
            data.fecha_registro,
            data.peso,
            data.grasa_corporal,
            data.medidas_json,
            data.foto_ruta,
            data.comentarios
        ]);
        return data;
    }

    async findByClienteId(clienteId) {
        const [rows] = await pool.query(`
            SELECT id, fecha_registro, peso, grasa_corporal, medidas_json, foto_ruta, comentarios 
            FROM seguimiento_fisico 
            WHERE cliente_id = ? 
            ORDER BY fecha_registro DESC
        `, [clienteId]);
        return rows;
    }

    async delete(id) {
        await pool.query('DELETE FROM seguimiento_fisico WHERE id = ?', [id]);
    }
}