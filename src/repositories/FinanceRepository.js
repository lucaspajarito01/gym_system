import pool from '../config/database.js';

export class FinanceRepository {
    async create(data, connection = pool) {
        const query = `
            INSERT INTO movimientos_financieros (tipo, categoria, monto, fecha, cliente_id, descripcion) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await connection.query(query, [
            data.tipo,
            data.categoria,
            data.monto,
            data.fecha || new Date(),
            data.cliente_id || null,
            data.descripcion || null
        ]);
        return { id: result.insertId, ...data };
    }

    async findAll() {
        const [rows] = await pool.query(`
            SELECT mf.id, mf.tipo, cs.nombre_categoria AS categoria, mf.monto, mf.fecha, 
                   COALESCE(c.nombre, 'General / Sin Cliente') AS cliente, mf.descripcion
            FROM movimientos_financieros mf
            JOIN categoria_servicios cs ON mf.categoria = cs.id
            LEFT JOIN clientes c ON mf.cliente_id = c.id
            ORDER BY mf.fecha DESC
        `);
        return rows;
    }

    async findByFechaRange(fechaInicio, fechaFin) {
        const [rows] = await pool.query(`
            SELECT mf.id, mf.tipo, cs.nombre_categoria AS categoria, mf.monto, mf.fecha, 
                   COALESCE(c.nombre, 'General / Sin Cliente') AS cliente, mf.descripcion
            FROM movimientos_financieros mf
            JOIN categoria_servicios cs ON mf.categoria = cs.id
            LEFT JOIN clientes c ON mf.cliente_id = c.id
            WHERE DATE(mf.fecha) BETWEEN ? AND ?
            ORDER BY mf.fecha DESC
        `, [fechaInicio, fechaFin]);
        return rows;
    }

    async findByCliente(clienteId) {
        const [rows] = await pool.query(`
            SELECT mf.id, mf.tipo, cs.nombre_categoria AS categoria, mf.monto, mf.fecha, 
                   c.nombre AS cliente, mf.descripcion
            FROM movimientos_financieros mf
            JOIN categoria_servicios cs ON mf.categoria = cs.id
            JOIN clientes c ON mf.cliente_id = c.id
            WHERE mf.cliente_id = ?
            ORDER BY mf.fecha DESC
        `, [clienteId]);
        return rows;
    }

    async listarCategorias() {
        const [rows] = await pool.query('SELECT id, nombre_categoria FROM categoria_servicios');
        return rows;
    }

    async findCategoryByName(nombre, connection = pool) {
        const [rows] = await connection.query(
            'SELECT id FROM categoria_servicios WHERE LOWER(TRIM(nombre_categoria)) = LOWER(?) LIMIT 1',
            [nombre]
        );
        return rows[0] || null;
    }

    async createCategory(nombre, connection = pool) {
        const [result] = await connection.query(
            'INSERT INTO categoria_servicios (nombre_categoria) VALUES (?)',
            [nombre]
        );
        return result.insertId;
    }
}