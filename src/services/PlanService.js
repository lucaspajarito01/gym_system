import { Plan } from '../models/Plan.js';
import { PlanRepository } from '../repositories/PlanRepository.js';
import { ContractRepository } from '../repositories/ContractRepository.js';
import pool from '../config/database.js';

export class PlanService {
    constructor() {
        this.planRepo = new PlanRepository();
        this.contractRepo = new ContractRepository();
    }

    async registrarPlan(data) {
        const plan = new Plan(data.nombre, data.duracion, data.metas_fisicas, data.nivel);
        return await this.planRepo.create(plan.toPlainObject());
    }

    async listarPlanes() {
        return await this.planRepo.findAll();
    }

    async actualizarPlan(id, data) {
        const planExistente = await this.planRepo.findById(id);
        if (!planExistente) {
            throw new Error(`No se encontró el plan de entrenamiento con ID ${id}`);
        }

        const nombre = data.nombre && data.nombre.trim() !== '' ? data.nombre : planExistente.nombre;
        const duracion = data.duracion && data.duracion.trim() !== '' ? data.duracion : planExistente.duracion;
        const metas_fisicas = data.metas_fisicas && data.metas_fisicas.trim() !== '' ? data.metas_fisicas : planExistente.metas_fisicas;
        const nivel = data.nivel ? String(data.nivel) : planExistente.nivel;

        const plan = new Plan(nombre, duracion, metas_fisicas, nivel);
        return await this.planRepo.update(id, plan.toPlainObject());
    }

    async eliminarPlan(id) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const [planes] = await connection.query(
                'SELECT id FROM plan_entrenamientos WHERE id = ? FOR UPDATE',
                [id]
            );
            if (planes.length === 0) {
                throw new Error(`No se encontró el plan de entrenamiento con ID ${id}`);
            }

            await this.contractRepo.deleteByPlan(id, connection);
            await this.planRepo.delete(id, connection);
            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}