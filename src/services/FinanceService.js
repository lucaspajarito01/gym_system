import pool from '../config/database.js';
import { FinanceRepository } from '../repositories/FinanceRepository.js';

export class FinanceService {
    constructor() {
        this.financeRepo = new FinanceRepository();
    }

    async registrarMovimientoConTransaccion(data) {
        // ACCIÓN CRÍTICA: Los pagos e ingresos/egresos financieros exigen atomicidad.
        // Iniciamos una conexión dedicada para manejar la transacción real.
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();

            // Validaciones de negocio
            if (!['ingreso', 'egreso'].includes(data.tipo)) {
                throw new Error("El tipo de movimiento debe ser 'ingreso' o 'egreso'.");
            }
            if (!data.monto || isNaN(data.monto) || Number(data.monto) <= 0) {
                throw new Error("El monto debe ser un valor numérico mayor a 0.");
            }

            let categoria = data.categoria;
            if (data.nombre_categoria !== undefined) {
                const nombreCategoria = String(data.nombre_categoria).trim();
                if (!nombreCategoria) {
                    throw new Error('El nombre de la categoría no puede estar vacío.');
                }
                if (nombreCategoria.length > 50) {
                    throw new Error('El nombre de la categoría no puede superar 50 caracteres.');
                }

                const categoriaExistente = await this.financeRepo.findCategoryByName(
                    nombreCategoria,
                    connection
                );
                categoria = categoriaExistente
                    ? categoriaExistente.id
                    : await this.financeRepo.createCategory(nombreCategoria, connection);
            }
            if (!Number.isInteger(Number(categoria)) || Number(categoria) <= 0) {
                throw new Error('Debe seleccionar o registrar una categoría válida.');
            }

            // Ejecución de la inserción utilizando la misma conexión de la transacción
            const nuevoMovimiento = await this.financeRepo.create({
                ...data,
                categoria: Number(categoria)
            }, connection);

            // Confirmar transacción (COMMIT) si todo sale bien
            await connection.commit();
            return nuevoMovimiento;

        } catch (error) {
            // ROLLBACK: En caso de error, revertimos cualquier cambio para evitar inconsistencias en pagos
            await connection.rollback();
            throw new Error(`Transacción fallida (Rollback ejecutado): ${error.message}`);
        } finally {
            // Liberar la conexión devuelta al pool
            connection.release();
        }
    }

    async obtenerMovimientos() {
        return await this.financeRepo.findAll();
    }

    async obtenerBalancePorFecha(fechaInicio, fechaFin) {
        return await this.financeRepo.findByFechaRange(fechaInicio, fechaFin);
    }

    async obtenerBalancePorCliente(clienteId) {
        return await this.financeRepo.findByCliente(clienteId);
    }

    async obtenerCategorias() {
        return await this.financeRepo.listarCategorias();
    }
}