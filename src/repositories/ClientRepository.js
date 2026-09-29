import pool from '../config/database.js';

export class ClientRepository {
    async create(clientData) {
        const query = 'INSERT INTO clientes (tipo_documento, nombre, edad, correo, telefono) VALUES (?, ?, ?, ?, ?)';
        await pool.query(query, [
            clientData.tipo_documento,
            clientData.nombre,
            clientData.edad,
            clientData.correo,
            clientData.telefono
        ]);
        return clientData;
    }

    async findAll() {
        const [rows] = await pool.query(`
            SELECT c.id, t.tipo AS tipo_documento, c.nombre, c.edad, c.correo, c.telefono 
            FROM clientes c
            JOIN tipo_documentos t ON c.tipo_documento = t.id
        `);
        return rows;
    }

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM clientes WHERE id = ?', [id]);
        return rows[0] || null;
    }

    async findByCorreo(correo) {
        const [rows] = await pool.query('SELECT * FROM clientes WHERE correo = ?', [correo]);
        return rows[0] || null;
    }

    async update(id, clientData) {
        const query = 'UPDATE clientes SET tipo_documento = ?, nombre = ?, edad = ?, correo = ?, telefono = ? WHERE id = ?';
        await pool.query(query, [
            clientData.tipo_documento,
            clientData.nombre,
            clientData.edad,
            clientData.correo,
            clientData.telefono,
            id
        ]);
        return clientData;
    }

    async delete(id) {
        await pool.query('DELETE FROM clientes WHERE id = ?', [id]);
    }

    async getTiposDocumento() {
        const [rows] = await pool.query('SELECT * FROM tipo_documentos');
        return rows;
    }
}