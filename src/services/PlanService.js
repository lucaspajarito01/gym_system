import { Plan } from '../models/Plan.js';
import { PlanRepository } from '../repositories/PlanRepository.js';

export class PlanService {
    constructor() {
        this.planRepo = new PlanRepository();
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
        const planExistente = await this.planRepo.findById(id);
        if (!planExistente) {
            throw new Error(`No se encontró el plan de entrenamiento con ID ${id}`);
        }
        await this.planRepo.delete(id);
    }
}