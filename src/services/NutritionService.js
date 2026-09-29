import { NutritionRepository } from '../repositories/NutritionRepository.js';
import { ClientRepository } from '../repositories/ClientRepository.js';
import { PlanRepository } from '../repositories/PlanRepository.js';

export class NutritionService {
    constructor() {
        this.nutritionRepo = new NutritionRepository();
        this.clientRepo = new ClientRepository();
        this.planRepo = new PlanRepository();
    }

    async crearPlanNutricion(data) {
        const cliente = await this.clientRepo.findById(data.cliente_id);
        if (!cliente) throw new Error(`No se encontró el cliente con ID ${data.cliente_id}`);

        // Corregido a plan_entrenamiento_id (en singular)
        const planEntreno = await this.planRepo.findById(data.plan_entrenamiento_id);
        if (!planEntreno) throw new Error(`No se encontró el plan de entrenamiento con ID ${data.plan_entrenamiento_id}`);

        return await this.nutritionRepo.createPlan(data);
    }

    async obtenerPlanesDeCliente(clienteId) {
        return await this.nutritionRepo.findPlanesByCliente(clienteId);
    }

    async registrarAlimento(data) {
        return await this.nutritionRepo.addAlimento(data);
    }

    async obtenerAlimentosDelPlan(planNutricionId) {
        return await this.nutritionRepo.findAlimentosByPlan(planNutricionId);
    }
}