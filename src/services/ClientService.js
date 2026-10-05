import { Client } from '../models/Client.js';
import { ClientRepository } from '../repositories/ClientRepository.js';
import { ContractRepository } from '../repositories/ContractRepository.js';
import pool from '../config/database.js';

export class ClientService {
    constructor() {
        this.clientRepo = new ClientRepository();
        this.contractRepository = new ContractRepository();
        
    }

    async registrarCliente(data) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            let tipoDocumentoId;
            if (data.tipo_documento === 'nuevo') {
                const tipo = String(data.nombre_tipo_documento || '').trim();
                if (!tipo) {
                    throw new Error('El tipo de documento es obligatorio.');
                }
                if (tipo.length > 10) {
                    throw new Error('El tipo de documento no puede superar 10 caracteres.');
                }

                const tipoExistente = await this.clientRepo.findTipoDocumentoByNombre(tipo, connection);
                tipoDocumentoId = tipoExistente
                    ? tipoExistente.id
                    : await this.clientRepo.createTipoDocumento(tipo, connection);
            } else {
                tipoDocumentoId = Number(data.tipo_documento);
                if (!Number.isInteger(tipoDocumentoId) || tipoDocumentoId <= 0) {
                    throw new Error('Debe seleccionar un tipo de documento válido.');
                }
            }

            const client = new Client(
                tipoDocumentoId,
                data.nombre,
                parseInt(data.edad),
                data.correo,
                data.telefono
            );

            const existe = await this.clientRepo.findByCorreo(client.correo, connection);
            if (existe) {
                throw new Error(`Ya existe un cliente registrado con el correo ${client.correo}`);
            }

            const nuevoCliente = await this.clientRepo.create(client.toPlainObject(), connection);
            await connection.commit();
            return nuevoCliente;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async listarClientes() {
        return await this.clientRepo.findAll();
    }

    async actualizarCliente(id, data) {
        const clienteExistente = await this.clientRepo.findById(id);
        if (!clienteExistente) {
            throw new Error(`No se encontró un cliente con el ID ${id}`);
        }
        const tipo_documento = data.tipo_documento ? parseInt(data.tipo_documento) : clienteExistente.tipo_documento;
        const nombre = data.nombre && data.nombre.trim() !== '' ? data.nombre : clienteExistente.nombre;
        const edad = data.edad && data.edad.trim() !== '' ? parseInt(data.edad) : clienteExistente.edad;
        const telefono = data.telefono && data.telefono.trim() !== '' ? data.telefono : clienteExistente.telefono;
        const correo = data.correo && data.correo.trim() !== '' ? data.correo : clienteExistente.correo;

        const client = new Client(tipo_documento, nombre, edad, correo, telefono);

        return await this.clientRepo.update(id, client.toPlainObject());
    }
    async eliminarCliente(id) {
        const clienteExistente = await this.clientRepo.findById(id);
        if (!clienteExistente) {
            throw new Error(`No se encontró un cliente con el ID ${id}`);
        }
        await this.clientRepo.delete(id);
    }

    async obtenerTiposDocumento() {
        return await this.clientRepo.getTiposDocumento();
    }

    async verContratoPorCliente(clienteId) {
    if (!clienteId || isNaN(clienteId)) {
        throw new Error("Debe ingresar un ID de cliente válido.");
    }

    const contratos = await this.contractRepository.obtenerContratoPorClienteId(clienteId);
    
    if (contratos.length === 0) {
        throw new Error("No se encontraron contratos activos para el ID de cliente proporcionado.");
    }

    return contratos;
}
}