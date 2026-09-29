import inquirer from 'inquirer';
import chalk from 'chalk';
import { ClientService } from '../services/ClientService.js';
import { PlanService } from '../services/PlanService.js';
import { ContractService } from '../services/ContractService.js';

export class ClientCommand {
    constructor() {
        this.clientService = new ClientService();
        this.planService = new PlanService();
        this.contractService = new ContractService();
    }

    async ejecutarMenu() {
        let salir = false;

        while (!salir) {
            console.clear();
            console.log(chalk.cyan.bold('=== GESTIÓN DE CLIENTES ==='));

            const { opcion } = await inquirer.prompt([
                {
                    type: 'select',
                    name: 'opcion',
                    message: 'Seleccione una acción:',
                    choices: [
                        { name: '1. Registrar nuevo cliente', value: 'crear' },
                        { name: '2. Listar todos los clientes', value: 'listar' },
                        { name: '3. Actualizar cliente', value: 'actualizar' },
                        { name: '4. Eliminar cliente', value: 'eliminar' },
                        { name: '5. Asignar plan y crear contrato', value: 'contrato' },
                        { name: '6. Ver contrato de usuario por ID', value: 'ver_contrato' },
                        { name: '7. Volver al menú principal', value: 'volver' }
                    ]
                }
            ]);

            switch (opcion) {
                case 'crear':
                    await this.crearClientePrompt();
                    break;
                case 'listar':
                    await this.listarClientesPrompt();
                    break;
                case 'actualizar':
                    await this.actualizarClientePrompt();
                    break;
                case 'eliminar':
                    await this.eliminarClientePrompt();
                    break;
                case 'contrato':
                    await this.asignarContratoPrompt();
                    break;
                case 'ver_contrato':
                    await this.verContratoPorId();
                    break;
                case 'volver':
                    salir = true;
                    break;
            }
        }
    }

    async crearClientePrompt() {
        try {
            const tiposDoc = await this.clientService.obtenerTiposDocumento();
            if (tiposDoc.length === 0) {
                console.log(chalk.yellow('\n⚠️ No hay tipos de documento en la BD.'));
                await inquirer.prompt([{ type: 'input', name: 'cont', message: 'Presiona Enter para continuar...' }]);
                return;
            }

            const choicesTipos = tiposDoc.map(t => ({ name: t.tipo, value: t.id }));

            const respuestas = await inquirer.prompt([
                { type: 'select', name: 'tipo_documento', message: 'Seleccione el tipo de documento:', choices: choicesTipos },
                { type: 'input', name: 'nombre', message: 'Ingrese nombre completo:' },
                { type: 'input', name: 'edad', message: 'Ingrese edad:' },
                { type: 'input', name: 'telefono', message: 'Ingrese teléfono:' },
                { type: 'input', name: 'correo', message: 'Ingrese correo electrónico:' }
            ]);

            await this.clientService.registrarCliente(respuestas);
            console.log(chalk.green('\n✅ ¡Cliente registrado exitosamente!'));
        } catch (error) {
            console.log(chalk.red(`\n❌ Error: ${error.message}`));
        }
        await inquirer.prompt([{ type: 'input', name: 'continuar', message: 'Presiona Enter para continuar...' }]);
    }

    async listarClientesPrompt() {
        try {
            const clientes = await this.clientService.listarClientes();
            if (clientes.length === 0) {
                console.log(chalk.yellow('\n⚠️ No hay clientes registrados.'));
            } else {
                console.table(clientes);
            }
        } catch (error) {
            console.log(chalk.red(`\n❌ Error al listar: ${error.message}`));
        }
        await inquirer.prompt([{ type: 'input', name: 'continuar', message: 'Presiona Enter para continuar...' }]);
    }

    async actualizarClientePrompt() {
        try {
            const clientes = await this.clientService.listarClientes();
            if (clientes.length === 0) {
                console.log(chalk.yellow('\n⚠️ No hay clientes para actualizar.'));
                await inquirer.prompt([{ type: 'input', name: 'cont', message: 'Presiona Enter para continuar...' }]);
                return;
            }

            const choicesClientes = clientes.map(c => ({ name: `${c.id} - ${c.nombre} (${c.correo})`, value: c.id }));

            const { idSeleccionado } = await inquirer.prompt([
                { type: 'select', name: 'idSeleccionado', message: 'Seleccione el cliente a actualizar:', choices: choicesClientes }
            ]);

            const tiposDoc = await this.clientService.obtenerTiposDocumento();
            const choicesTipos = tiposDoc.map(t => ({ name: t.tipo, value: t.id }));

            const respuestas = await inquirer.prompt([
                { type: 'select', name: 'tipo_documento', message: 'Nuevo tipo de documento:', choices: choicesTipos },
                { type: 'input', name: 'nombre', message: 'Nuevo nombre completo (dejar en blanco para no cambiar):' },
                { type: 'input', name: 'edad', message: 'Nueva edad (dejar en blanco para no cambiar):' },
                { type: 'input', name: 'telefono', message: 'Nuevo teléfono (dejar en blanco para no cambiar):' },
                { type: 'input', name: 'correo', message: 'Nuevo correo electrónico (dejar en blanco para no cambiar):' }
            ]);

            await this.clientService.actualizarCliente(idSeleccionado, respuestas);
            console.log(chalk.green('\n✅ ¡Cliente actualizado exitosamente!'));
        } catch (error) {
            console.log(chalk.red(`\n❌ Error: ${error.message}`));
        }
        await inquirer.prompt([{ type: 'input', name: 'continuar', message: 'Presiona Enter para continuar...' }]);
    }

    async eliminarClientePrompt() {
        try {
            const clientes = await this.clientService.listarClientes();
            if (clientes.length === 0) {
                console.log(chalk.yellow('\n⚠️ No hay clientes para eliminar.'));
                await inquirer.prompt([{ type: 'input', name: 'cont', message: 'Presiona Enter para continuar...' }]);
                return;
            }

            const choicesClientes = clientes.map(c => ({ name: `${c.id} - ${c.nombre} (${c.correo})`, value: c.id }));

            const { idSeleccionado } = await inquirer.prompt([
                { type: 'select', name: 'idSeleccionado', message: 'Seleccione el cliente a eliminar:', choices: choicesClientes }
            ]);

            const { confirmar } = await inquirer.prompt([
                { type: 'select', name: 'confirmar', message: '¿Está seguro de eliminar este cliente?', choices: [{ name: 'Sí', value: true }, { name: 'No', value: false }] }
            ]);

            if (confirmar) {
                await this.clientService.eliminarCliente(idSeleccionado);
                console.log(chalk.green('\n✅ ¡Cliente eliminado exitosamente!'));
            } else {
                console.log(chalk.yellow('\n⚠️ Operación cancelada.'));
            }
        } catch (error) {
            console.log(chalk.red(`\n❌ Error: ${error.message}`));
        }
        await inquirer.prompt([{ type: 'input', name: 'continuar', message: 'Presiona Enter para continuar...' }]);
    }

    async asignarContratoPrompt() {
        try {
            const clientes = await this.clientService.listarClientes();
            if (clientes.length === 0) {
                console.log(chalk.yellow('\n⚠️ No hay clientes registrados para asignar planes.'));
                await inquirer.prompt([{ type: 'input', name: 'cont', message: 'Presiona Enter para continuar...' }]);
                return;
            }

            const choicesClientes = clientes.map(c => ({ name: `${c.id} - ${c.nombre} (${c.correo})`, value: c.id }));
            const { clienteId } = await inquirer.prompt([
                { type: 'select', name: 'clienteId', message: 'Seleccione el cliente:', choices: choicesClientes }
            ]);

            const planes = await this.planService.listarPlanes();
            if (planes.length === 0) {
                console.log(chalk.yellow('\n⚠️ No hay planes de entrenamiento creados. Cree uno primero.'));
                await inquirer.prompt([{ type: 'input', name: 'cont', message: 'Presiona Enter para continuar...' }]);
                return;
            }

            const choicesPlanes = planes.map(p => ({ name: `${p.nombre} (Nivel ${p.nivel} - ${p.duracion})`, value: p.id }));
            const { planId } = await inquirer.prompt([
                { type: 'select', name: 'planId', message: 'Seleccione el plan de entrenamiento a asignar:', choices: choicesPlanes }
            ]);

            const { meses } = await inquirer.prompt([
                { type: 'input', name: 'meses', message: 'Ingrese la duración del contrato en meses (ej. 1, 3, 6):', default: '1' }
            ]);

            await this.contractService.asignarPlanACliente(clienteId, planId, meses);

            console.log(chalk.green('\n✅ ¡Plan asignado y contrato creado exitosamente de forma automática!'));
        } catch (error) {
            console.log(chalk.red(`\n❌ Error al crear contrato: ${error.message}`));
        }
        await inquirer.prompt([{ type: 'input', name: 'continuar', message: 'Presiona Enter para continuar...' }]);
    }

    async verContratoPorId() {
    const { clienteId } = await inquirer.prompt([
        { 
            type: 'input', 
            name: 'clienteId', 
            message: 'Ingrese el ID del cliente para consultar su contrato:' 
        }
    ]);

    try {
        const contratos = await this.clientService.verContratoPorCliente(clienteId);
        console.log(chalk.green('\n--- CONTRATO(S) ENCONTRADO(S) ---'));
        console.table(contratos);
    } catch (error) {
        console.log(chalk.red(`\n[Aviso]: ${error.message}`));
    }

    await inquirer.prompt([
        { type: 'input', name: 'continuar', message: 'Presiona Enter para continuar...' }
    ]);
}
}