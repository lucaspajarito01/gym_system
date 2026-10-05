import mysql from 'mysql2/promise';

export class AttendanceService {
    constructor() {
        this.db = mysql.createPool({
            host: DB_HOST || 'localhost',
            user: DB_USER || 'root',
            password: DB_PASSWORD || '',
            database: DB_NAME || 'gym_system',
        });
    }

    async registrarAsistencia({ clientId, planId, sessionType, notes }) {
        const query = `
            INSERT INTO attendances (client_id, plan_id, date, session_type, notes)
            VALUES (?, ?, NOW(), ?, ?)
        `;
        const [result] = await this.db.execute(query, [clientId, planId, sessionType, notes]);
        return result.insertId;
    }

    async listarAsistencias({ clientId, startDate, endDate }) {
        let query = `SELECT * FROM attendances WHERE 1=1`;
        const params = [];

        if (clientId) {
            query += ` AND client_id = ?`;
            params.push(clientId);
        }
        if (startDate && endDate) {
            query += ` AND date BETWEEN ? AND ?`;
            params.push(startDate, endDate);
        }

        const [rows] = await this.db.execute(query, params);
        return rows;
    }

    async generarReporteSemanal(clientId) {
        const query = `
            SELECT 
                COUNT(*) AS total_sessions,
                (SELECT COUNT(*) FROM attendances WHERE client_id = ? AND WEEK(date) = WEEK(NOW())) AS attended_sessions
            FROM plans
            WHERE client_id = ?
        `;
        const [rows] = await this.db.execute(query, [clientId, clientId]);
        const { total_sessions, attended_sessions } = rows[0];
        const complianceRate = total_sessions > 0 ? (attended_sessions / total_sessions) * 100 : 0;

        return { total_sessions, attended_sessions, complianceRate };
    }
}