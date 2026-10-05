import { ContractRepository } from '../repositories/ContractRepository.js';
import pool from '../config/database.js';

export class ContractService {
    constructor() {
        this.contractRepo = new ContractRepository();
    }

    async asignarPlanACliente(clienteId, planId, duracionMeses = 1) {
        clienteId = Number(clienteId);
        planId = Number(planId);
        duracionMeses = Number(duracionMeses);

        if (!Number.isInteger(clienteId) || clienteId <= 0) {
            throw new Error('Debe ingresar un ID de cliente válido.');
        }
        if (!Number.isInteger(planId) || planId <= 0) {
            throw new Error('Debe ingresar un ID de plan válido.');
        }
        if (!Number.isInteger(duracionMeses) || duracionMeses <= 0) {
            throw new Error('La duración del contrato debe ser un número de meses mayor a 0.');
        }

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const [clientes] = await connection.query(
                'SELECT id FROM clientes WHERE id = ? FOR UPDATE',
                [clienteId]
            );
            if (clientes.length === 0) {
                throw new Error(`No se encontró un cliente con el ID ${clienteId}.`);
            }

            const [planes] = await connection.query(
                'SELECT id FROM plan_entrenamientos WHERE id = ? FOR UPDATE',
                [planId]
            );
            if (planes.length === 0) {
                throw new Error(`No se encontró un plan con el ID ${planId}.`);
            }

            const contratoExistente = await this.contractRepo.findByClienteAndPlan(
                clienteId,
                planId,
                connection
            );
            if (contratoExistente) {
                throw new Error('El cliente ya tiene asignado este plan.');
            }

            const fechaInicio = new Date();
            const fechaFin = new Date(fechaInicio);
            fechaFin.setMonth(fechaInicio.getMonth() + duracionMeses);

            const contractData = {
                cliente_id: clienteId,
                plan_id: planId,
                fecha_inicio: fechaInicio.toISOString().split('T')[0],
                fecha_fin: fechaFin.toISOString().split('T')[0],
                estado: 'activo'
            };

            const contrato = await this.contractRepo.create(contractData, connection);
            await connection.commit();
            return contrato;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async obtenerContratosDeCliente(clienteId) {
        return await this.contractRepo.findByClienteId(clienteId);
    }

    async eliminarPlanAsignado(clienteId, planId) {
        clienteId = Number(clienteId);
        planId = Number(planId);
        if (!Number.isInteger(clienteId) || clienteId <= 0 || !Number.isInteger(planId) || planId <= 0) {
            throw new Error('Debe ingresar un cliente y un plan válidos.');
        }

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const [clientes] = await connection.query(
                'SELECT id FROM clientes WHERE id = ? FOR UPDATE',
                [clienteId]
            );
            if (clientes.length === 0) {
                throw new Error(`No se encontró un cliente con el ID ${clienteId}.`);
            }

            const contratosEliminados = await this.contractRepo.deleteByClienteAndPlan(
                clienteId,
                planId,
                connection
            );
            if (contratosEliminados === 0) {
                throw new Error('El cliente no tiene asignado este plan.');
            }

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async verContratoPorCliente(clienteId) {
        if (!clienteId || isNaN(clienteId)) {
            throw new Error("Debe ingresar un ID de cliente válido.");
        }

        const contratos = await this.contractRepo.obtenerContratoPorClienteId(clienteId);

        if (contratos.length === 0) {
            throw new Error("No se encontraron contratos activos para el ID de cliente proporcionado.");
        }

        return contratos;
    }
}