import inquirer from 'inquirer';
import chalk from 'chalk';
import { PlanService } from '../services/PlanService.js';

export class PlanCommand {
    constructor() {
        this.planService = new PlanService();
    }

    async ejecutarMenu() {
        let salir = false;

        while (!salir) {
            console.clear();
            console.log(chalk.cyan.bold('=== GESTIÓN DE PLANES DE ENTRENAMIENTO ==='));

            const { opcion } = await inquirer.prompt([
                {
                    type: 'select',
                    name: 'opcion',
                    message: 'Seleccione una acción:',
                    choices: [
                        { name: '1. Registrar nuevo plan', value: 'crear' },
                        { name: '2. Listar todos los planes', value: 'listar' },
                        { name: '3. Actualizar plan', value: 'actualizar' },
                        { name: '4. Eliminar plan', value: 'eliminar' },
                        { name: '5. Volver al menú principal', value: 'volver' }
                    ]
                }
            ]);

            switch (opcion) {
                case 'crear':
                    await this.crearPlanPrompt();
                    break;
                case 'listar':
                    await this.listarPlanesPrompt();
                    break;
                case 'actualizar':
                    await this.actualizarPlanPrompt();
                    break;
                case 'eliminar':
                    await this.eliminarPlanPrompt();
                    break;
                case 'volver':
                    salir = true;
                    break;
            }
        }
    }

    async crearPlanPrompt() {
        try {
            const respuestas = await inquirer.prompt([
                { type: 'input', name: 'nombre', message: 'Ingrese nombre del plan (máx 30 chars):' },
                { type: 'input', name: 'duracion', message: 'Ingrese duración (ej. 3 meses):' },
                { type: 'input', name: 'metas_fisicas', message: 'Ingrese metas físicas:' },
                { 
                    type: 'select', 
                    name: 'nivel', 
                    message: 'Seleccione nivel de dificultad:',
                    choices: [
                        { name: 'Nivel 1', value: '1' },
                        { name: 'Nivel 2', value: '2' },
                        { name: 'Nivel 3', value: '3' },
                        { name: 'Nivel 4', value: '4' },
                        { name: 'Nivel 5', value: '5' }
                    ]
                }
            ]);

            await this.planService.registrarPlan(respuestas);
            console.log(chalk.green('\n✅ ¡Plan de entrenamiento registrado exitosamente!'));
        } catch (error) {
            console.log(chalk.red(`\n❌ Error: ${error.message}`));
        }
        await inquirer.prompt([{ type: 'input', name: 'continuar', message: 'Presiona Enter para continuar...' }]);
    }

    async listarPlanesPrompt() {
        try {
            const planes = await this.planService.listarPlanes();
            if (planes.length === 0) {
                console.log(chalk.yellow('\n⚠️ No hay planes de entrenamiento registrados.'));
            } else {
                console.table(planes);
            }
        } catch (error) {
            console.log(chalk.red(`\n❌ Error al listar: ${error.message}`));
        }
        await inquirer.prompt([{ type: 'input', name: 'continuar', message: 'Presiona Enter para continuar...' }]);
    }

    async actualizarPlanPrompt() {
        try {
            const planes = await this.planService.listarPlanes();
            if (planes.length === 0) {
                console.log(chalk.yellow('\n⚠️ No hay planes para actualizar.'));
                await inquirer.prompt([{ type: 'input', name: 'cont', message: 'Presiona Enter para continuar...' }]);
                return;
            }

            const choicesPlanes = planes.map(p => ({ name: `${p.id} - ${p.nombre} (Nivel ${p.nivel})`, value: p.id }));

            const { idSeleccionado } = await inquirer.prompt([
                { type: 'select', name: 'idSeleccionado', message: 'Seleccione el plan a actualizar:', choices: choicesPlanes }
            ]);

            const respuestas = await inquirer.prompt([
                { type: 'input', name: 'nombre', message: 'Nuevo nombre (dejar en blanco para no cambiar):' },
                { type: 'input', name: 'duracion', message: 'Nueva duración (dejar en blanco para no cambiar):' },
                { type: 'input', name: 'metas_fisicas', message: 'Nuevas metas físicas (dejar en blanco para no cambiar):' },
                { 
                    type: 'select', 
                    name: 'nivel', 
                    message: 'Nuevo nivel:',
                    choices: [
                        { name: 'Mantener actual / Ninguno', value: '' },
                        { name: 'Nivel 1', value: '1' },
                        { name: 'Nivel 2', value: '2' },
                        { name: 'Nivel 3', value: '3' },
                        { name: 'Nivel 4', value: '4' },
                        { name: 'Nivel 5', value: '5' }
                    ]
                }
            ]);

            // Limpiar si eligió no cambiar en el select de nivel
            if (respuestas.nivel === '') delete respuestas.nivel;

            await this.planService.actualizarPlan(idSeleccionado, respuestas);
            console.log(chalk.green('\n✅ ¡Plan actualizado exitosamente!'));
        } catch (error) {
            console.log(chalk.red(`\n❌ Error: ${error.message}`));
        }
        await inquirer.prompt([{ type: 'input', name: 'continuar', message: 'Presiona Enter para continuar...' }]);
    }

    async eliminarPlanPrompt() {
        try {
            const planes = await this.planService.listarPlanes();
            if (planes.length === 0) {
                console.log(chalk.yellow('\n⚠️ No hay planes para eliminar.'));
                await inquirer.prompt([{ type: 'input', name: 'cont', message: 'Presiona Enter para continuar...' }]);
                return;
            }

            const choicesPlanes = planes.map(p => ({ name: `${p.id} - ${p.nombre}`, value: p.id }));

            const { idSeleccionado } = await inquirer.prompt([
                { type: 'select', name: 'idSeleccionado', message: 'Seleccione el plan a eliminar:', choices: choicesPlanes }
            ]);

            const { confirmar } = await inquirer.prompt([
                { type: 'select', name: 'confirmar', message: '¿Está seguro de eliminar este plan?', choices: [{ name: 'Sí', value: true }, { name: 'No', value: false }] }
            ]);

            if (confirmar) {
                await this.planService.eliminarPlan(idSeleccionado);
                console.log(chalk.green('\n✅ ¡Plan eliminado exitosamente!'));
            } else {
                console.log(chalk.yellow('\n⚠️ Operación cancelada.'));
            }
        } catch (error) {
            console.log(chalk.red(`\n❌ Error: ${error.message}`));
        }
        await inquirer.prompt([{ type: 'input', name: 'continuar', message: 'Presiona Enter para continuar...' }]);
    }
}