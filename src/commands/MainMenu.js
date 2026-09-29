import inquirer from 'inquirer';
import chalk from 'chalk';
import { ClientCommand } from './ClientCommand.js';
import { PlanCommand } from './PlanCommand.js';
import { SeguimientoCommand } from './SeguimientoCommand.js';
import { NutritionCommand } from './NutritionCommand.js';
import { FinanceCommand } from './FinanceCommand.js';

export class MainMenu {
    async iniciar() {
        let salir = false;

        while (!salir) {
            console.clear();
            console.log(chalk.blue.bold('|==============================================|'));
            console.log(chalk.blue.bold('| ===========      GYM SYSTEM         =========|'));
            console.log(chalk.blue.bold('|==============================================|'));

            const { opcion } = await inquirer.prompt([
                {
                    type: 'select',
                    name: 'opcion',
                    message: 'MENÚ PRINCIPAL - Selecciona un módulo:',
                    choices: [
                        { name: '1. Gestión de Clientes', value: 'clientes' },
                        { name: '2. Gestión de Planes y Contratos', value: 'planes' },
                        { name: '3. Seguimiento Físico', value: 'seguimiento' },
                        { name: '3. Plan Nutricion', value: 'nutricion' },
                        { name: '4. Gestión Financiera', value: 'finanzas' },
                        { name: '5. Salir', value: 'salir' }
                    ]
                }
            ]);

            switch (opcion) {
                case 'clientes':
                    const clientCommand = new ClientCommand();
                    await clientCommand.ejecutarMenu();
                    break;
                case 'planes':
                     const planCommand = new PlanCommand();
                     await planCommand.ejecutarMenu();
                     break;
                case 'seguimiento':
                    const seguimientoCommand = new SeguimientoCommand();
                    await seguimientoCommand.ejecutarMenu();
                    break;
                case 'nutricion':
                    const nutritionCommand = new NutritionCommand();
                    await nutritionCommand.ejecutarMenu();
                    break;
                case 'finanzas':
                    const financeCommand = new FinanceCommand();
                    await financeCommand.ejecutarMenu();
                    break;
                case 'salir':
                    salir = true;
                    console.log(chalk.green('\n¡Gracias por usar Gym System! Hasta luego. 👋'));
                    break;
            }
        }
    }
}