import inquirer from 'inquirer';
import chalk from 'chalk';
import { SeguimientoService } from '../services/SeguimientoService.js';
import { ClientService } from '../services/ClientService.js';

export class SeguimientoCommand {
    constructor() {
        this.seguimientoService = new SeguimientoService();
        this.clientService = new ClientService();
    }

    async ejecutarMenu() {
        let salir = false;

        while (!salir) {
            console.clear();
            console.log(chalk.cyan.bold('=== SEGUIMIENTO FÍSICO DE CLIENTES ==='));

            const { opcion } = await inquirer.prompt([
                {
                    type: 'select',
                    name: 'opcion',
                    message: 'Seleccione una acción:',
                    choices: [
                        { name: '1. Registrar nueva evaluación física', value: 'crear' },
                        { name: '2. Ver historial de un cliente', value: 'historial' },
                        { name: '3. Volver al menú principal', value: 'volver' }
                    ]
                }
            ]);

            switch (opcion) {
                case 'crear':
                    await this.crearSeguimientoPrompt();
                    break;
                case 'historial':
                    await this.verHistorialPrompt();
                    break;
                case 'volver':
                    salir = true;
                    break;
            }
        }
    }

    async crearSeguimientoPrompt() {
        try {
            const clientes = await this.clientService.listarClientes();
            if (clientes.length === 0) {
                console.log(chalk.yellow('\n⚠️ No hay clientes registrados.'));
                await inquirer.prompt([{ type: 'input', name: 'cont', message: 'Presiona Enter para continuar...' }]);
                return;
            }

            const choicesClientes = clientes.map(c => ({ name: `${c.id} - ${c.nombre} (${c.correo})`, value: c.id }));

            const { cliente_id } = await inquirer.prompt([
                { type: 'select', name: 'cliente_id', message: 'Seleccione el cliente a evaluar:', choices: choicesClientes }
            ]);

            const fechaActual = new Date().toISOString().split('T')[0];

            const respuestasBase = await inquirer.prompt([
                { type: 'input', name: 'fecha_registro', message: 'Ingrese la fecha (YYYY-MM-DD):', default: fechaActual },
                { type: 'input', name: 'peso', message: 'Ingrese peso actual (kg):' },
                { type: 'input', name: 'grasa_corporal', message: 'Porcentaje de grasa corporal (opcional):' }
            ]);

            // Capturar medidas opcionales para estructurarlas en JSON
            console.log(chalk.cyan('\n--- Medidas Corporales Opcionales (cm) ---'));
            const medidasInput = await inquirer.prompt([
                { type: 'input', name: 'pecho', message: 'Pecho (opcional):' },
                { type: 'input', name: 'cintura', message: 'Cintura (opcional):' },
                { type: 'input', name: 'brazo', message: 'Brazo (opcional):' },
                { type: 'input', name: 'pierna', message: 'Pierna (opcional):' }
            ]);

            const medidas_json = {};
            if (medidasInput.pecho) medidas_json.pecho = medidasInput.pecho;
            if (medidasInput.cintura) medidas_json.cintura = medidasInput.cintura;
            if (medidasInput.brazo) medidas_json.brazo = medidasInput.brazo;
            if (medidasInput.pierna) medidas_json.pierna = medidasInput.pierna;

            const extras = await inquirer.prompt([
                { type: 'input', name: 'foto_ruta', message: 'Ruta de la foto o archivo (opcional):' },
                { type: 'input', name: 'comentarios', message: 'Comentarios u observaciones (opcional):' }
            ]);

            const datosFinales = {
                cliente_id,
                fecha_registro: respuestasBase.fecha_registro,
                peso: respuestasBase.peso,
                grasa_corporal: respuestasBase.grasa_corporal,
                medidas_json: Object.keys(medidas_json).length > 0 ? JSON.stringify(medidas_json) : null,
                foto_ruta: extras.foto_ruta,
                comentarios: extras.comentarios
            };

            await this.seguimientoService.registrarSeguimiento(datosFinales);
            console.log(chalk.green('\n✅ ¡Evaluación física completa registrada exitosamente!'));
        } catch (error) {
            console.log(chalk.red(`\n❌ Error: ${error.message}`));
        }
        await inquirer.prompt([{ type: 'input', name: 'continuar', message: 'Presiona Enter para continuar...' }]);
    }

    async verHistorialPrompt() {
        try {
            const clientes = await this.clientService.listarClientes();
            if (clientes.length === 0) {
                console.log(chalk.yellow('\n⚠️ No hay clientes registrados.'));
                await inquirer.prompt([{ type: 'input', name: 'cont', message: 'Presiona Enter para continuar...' }]);
                return;
            }

            const choicesClientes = clientes.map(c => ({ name: `${c.id} - ${c.nombre} (${c.correo})`, value: c.id }));

            const { cliente_id } = await inquirer.prompt([
                { type: 'select', name: 'cliente_id', message: 'Seleccione el cliente para ver su historial:', choices: choicesClientes }
            ]);

            const historial = await this.seguimientoService.obtenerHistorialCliente(cliente_id);
            if (historial.length === 0) {
                console.log(chalk.yellow('\n⚠️ El cliente seleccionado no cuenta con registros de seguimiento físico.'));
            } else {
                console.log(chalk.cyan(`\n--- Historial de Evaluaciones ---`));
                console.table(historial);
            }
        } catch (error) {
            console.log(chalk.red(`\n❌ Error al obtener historial: ${error.message}`));
        }
        await inquirer.prompt([{ type: 'input', name: 'continuar', message: 'Presiona Enter para continuar...' }]);
    }
}