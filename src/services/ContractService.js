import { ContractRepository } from '../repositories/ContractRepository.js';

export class ContractService {
    constructor() {
        this.contractRepo = new ContractRepository();
    }

    async asignarPlanACliente(clienteId, planId, duracionMeses = 1) {
        const fechaInicio = new Date();
        
        // Calcular fecha fin sumando los meses correspondientes
        const fechaFin = new Date();
        fechaFin.setMonth(fechaInicio.getMonth() + parseInt(duracionMeses));

        const contractData = {
            cliente_id: clienteId,
            plan_id: planId,
            fecha_inicio: fechaInicio.toISOString().split('T')[0],
            fecha_fin: fechaFin.toISOString().split('T')[0],
            estado: 'activo'
        };

        return await this.contractRepo.create(contractData);
    }

    async obtenerContratosDeCliente(clienteId) {
        return await this.contractRepo.findByClienteId(clienteId);
    }
}