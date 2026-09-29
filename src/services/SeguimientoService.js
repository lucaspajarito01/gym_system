import { SeguimientoFisico } from '../models/SeguimientoFisico.js';
import { SeguimientoRepository } from '../repositories/SeguimientoRepository.js';
import { ClientRepository } from '../repositories/ClientRepository.js';

export class SeguimientoService {
    constructor() {
        this.seguimientoRepo = new SeguimientoRepository();
        this.clientRepo = new ClientRepository();
    }

    async registrarSeguimiento(data) {
        const cliente = await this.clientRepo.findById(data.cliente_id);
        if (!cliente) {
            throw new Error(`No se encontró el cliente con ID ${data.cliente_id}`);
        }

        const seguimiento = new SeguimientoFisico(
            data.cliente_id,
            data.fecha_registro,
            data.peso,
            data.grasa_corporal,
            data.medidas_json,
            data.foto_ruta,
            data.comentarios
        );

        return await this.seguimientoRepo.create(seguimiento.toPlainObject());
    }

    async obtenerHistorialCliente(clienteId) {
        return await this.seguimientoRepo.findByClienteId(clienteId);
    }

    async eliminarSeguimiento(id) {
        await this.seguimientoRepo.delete(id);
    }
}