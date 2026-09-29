import inquirer from 'inquirer';
import chalk from 'chalk';
import { NutritionService } from '../services/NutritionService.js';
import { ClientService } from '../services/ClientService.js';
import { PlanService } from '../services/PlanService.js';

export class NutritionCommand {
    constructor() {
        this.nutritionService = new NutritionService();
        this.clientService = new ClientService();
        this.planService = new PlanService();
    }

    async ejecutarMenu() {
        let salir = false;

        while (!salir) {
            console.clear();
            console.log(chalk.cyan.bold('=== GESTIÓN DE PLANES DE NUTRICIÓN Y DIETAS ==='));

            const { opcion } = await inquirer.prompt([
                {
                    type: 'select',
                    name: 'opcion',
                    message: 'Seleccione una acción:',
                    choices: [
                        { name: '1. Asignar plan de nutrición a cliente', value: 'crear_plan' },
                        { name: '2. Registrar alimento diario en una dieta', value: 'crear_alimento' },
                        { name: '3. Ver planes y alimentos de un cliente', value: 'listar' },
                        { name: '4. Volver al menú principal', value: 'volver' }
                    ]
                }
            ]);

            switch (opcion) {
                case 'crear_plan':
                    await this.crearPlanPrompt();
                    break;
                case 'crear_alimento':
                    await this.registrarAlimentoPrompt();
                    break;
                case 'listar':
                    await this.listarNutricionPrompt();
                    break;
                case 'volver':
                    salir = true;
                    break;
            }
        }
    }
async crearPlanPrompt() {
        try {
            const clientes = await this.clientService.listarClientes();
            if (clientes.length === 0) {
                console.log(chalk.yellow('\n⚠️ No hay clientes registrados.'));
                await inquirer.prompt([{ type: 'input', name: 'cont', message: 'Presiona Enter para continuar...' }]);
                return;
            }

            const choicesClientes = clientes.map(c => ({ name: `${c.id} - ${c.nombre}`, value: c.id }));
            const { cliente_id } = await inquirer.prompt([
                { type: 'select', name: 'cliente_id', message: 'Seleccione el cliente:', choices: choicesClientes }
            ]);

            const planes = await this.planService.listarPlanes();
            if (planes.length === 0) {
                console.log(chalk.yellow('\n⚠️ No hay planes de entrenamiento creados.'));
                await inquirer.prompt([{ type: 'input', name: 'cont', message: 'Presiona Enter para continuar...' }]);
                return;
            }

            const choicesPlanes = planes.map(p => ({ name: `${p.id} - ${p.nombre} (Nivel ${p.nivel})`, value: p.id }));
            
            // Usamos 'select' que es el tipo soportado en tu entorno
            const { plan_entrenamiento_id } = await inquirer.prompt([
                { type: 'select', name: 'plan_entrenamiento_id', message: 'Seleccione el plan de entrenamiento asociado:', choices: choicesPlanes }
            ]);

            const { nombre_dieta } = await inquirer.prompt([
                { type: 'input', name: 'nombre_dieta', message: 'Ingrese el nombre de la dieta (ej. Dieta de Volumen):' }
            ]);

            if (!plan_entrenamiento_id) {
                throw new Error('Debe seleccionar un plan de entrenamiento válido.');
            }

            await this.nutritionService.crearPlanNutricion({ 
                cliente_id, 
                plan_entrenamiento_id, 
                nombre_dieta 
            });

            console.log(chalk.green('\n✅ ¡Plan de nutrición asignado exitosamente!'));
        } catch (error) {
            console.log(chalk.red(`\n❌ Error: ${error.message}`));
        }
        await inquirer.prompt([{ type: 'input', name: 'continuar', message: 'Presiona Enter para continuar...' }]);
    }
    

    async registrarAlimentoPrompt() {
        try {
            const clientes = await this.clientService.listarClientes();
            if (clientes.length === 0) {
                console.log(chalk.yellow('\n⚠️ No hay clientes registrados.'));
                await inquirer.prompt([{ type: 'input', name: 'cont', message: 'Presiona Enter para continuar...' }]);
                return;
            }

            const choicesClientes = clientes.map(c => ({ name: `${c.id} - ${c.nombre}`, value: c.id }));
            const { cliente_id } = await inquirer.prompt([
                { type: 'select', name: 'cliente_id', message: 'Seleccione el cliente:', choices: choicesClientes }
            ]);

            const planesNutricion = await this.nutritionService.obtenerPlanesDeCliente(cliente_id);
            if (planesNutricion.length === 0) {
                console.log(chalk.yellow('\n⚠️ Este cliente no tiene planes de nutrición asignados.'));
                await inquirer.prompt([{ type: 'input', name: 'cont', message: 'Presiona Enter para continuar...' }]);
                return;
            }

            const choicesPlanesNutri = planesNutricion.map(pn => ({ name: `${pn.nombre_dieta} (Plan Entreno: ${pn.plan_entrenamiento})`, value: pn.id }));
            const { plan_nutricion_id } = await inquirer.prompt([
                { type: 'select', name: 'plan_nutricion_id', message: 'Seleccione la dieta:', choices: choicesPlanesNutri }
            ]);

            const fechaActual = new Date().toISOString().split('T')[0];
            const respuestas = await inquirer.prompt([
                { type: 'input', name: 'fecha', message: 'Fecha de consumo (YYYY-MM-DD):', default: fechaActual },
                { type: 'input', name: 'nombre_alimento', message: 'Nombre del alimento o platillo:' },
                { type: 'input', name: 'calorias_estimadas', message: 'Calorías estimadas (kcal):' }
            ]);

            respuestas.plan_nutricion_id = plan_nutricion_id;
            respuestas.calorias_estimadas = parseInt(respuestas.calorias_estimadas);

            await this.nutritionService.registrarAlimento(respuestas);
            console.log(chalk.green('\n✅ ¡Alimento diario registrado exitosamente!'));
        } catch (error) {
            console.log(chalk.red(`\n❌ Error: ${error.message}`));
        }
        await inquirer.prompt([{ type: 'input', name: 'continuar', message: 'Presiona Enter para continuar...' }]);
    }

    async listarNutricionPrompt() {
        try {
            const clientes = await this.clientService.listarClientes();
            if (clientes.length === 0) {
                console.log(chalk.yellow('\n⚠️ No hay clientes registrados.'));
                await inquirer.prompt([{ type: 'input', name: 'cont', message: 'Presiona Enter para continuar...' }]);
                return;
            }

            const choicesClientes = clientes.map(c => ({ name: `${c.id} - ${c.nombre}`, value: c.id }));
            const { cliente_id } = await inquirer.prompt([
                { type: 'select', name: 'cliente_id', message: 'Seleccione el cliente a consultar:', choices: choicesClientes }
            ]);

            const planes = await this.nutritionService.obtenerPlanesDeCliente(cliente_id);
            if (planes.length === 0) {
                console.log(chalk.yellow('\n⚠️ No hay planes de nutrición para este cliente.'));
            } else {
                console.log(chalk.cyan('\n--- Planes de Nutrición ---'));
                console.table(planes);

                // Opcional: ver alimentos del primer plan encontrado o dejarlo listado
                for (const plan of planes) {
                    const alimentos = await this.nutritionService.obtenerAlimentosDelPlan(plan.id);
                    if (alimentos.length > 0) {
                        console.log(chalk.yellow(`\nAlimentos para la dieta: ${plan.nombre_dieta}`));
                        console.table(alimentos);
                    }
                }
            }
        } catch (error) {
            console.log(chalk.red(`\n❌ Error: ${error.message}`));
        }
        await inquirer.prompt([{ type: 'input', name: 'continuar', message: 'Presiona Enter para continuar...' }]);
    }
}