import inquirer from 'inquirer';
import chalk from 'chalk';
import { FinanceService } from '../services/FinanceService.js';
import { ClientService } from '../services/ClientService.js';

export class FinanceCommand {
    constructor() {
        this.financeService = new FinanceService();
        this.clientService = new ClientService();
    }

    async ejecutarMenu() {
        let salir = false;

        while (!salir) {
            console.clear();
            console.log(chalk.cyan.bold('=== 6. GESTIÓN FINANCIERA Y TRANSACCIONES ==='));

            const { opcion } = await inquirer.prompt([
                {
                    type: 'select',
                    name: 'opcion',
                    message: 'Seleccione una acción financiera:',
                    choices: [
                        { name: '1. Registrar ingreso (Mensualidades, sesiones, etc.)', value: 'ingreso' },
                        { name: '2. Registrar egreso (Servicios, suplementos, gastos)', value: 'egreso' },
                        { name: '3. Ver historial general de movimientos', value: 'listar' },
                        { name: '4. Consultar balance por rango de fechas', value: 'filtro_fecha' },
                        { name: '5. Consultar balance por cliente', value: 'filtro_cliente' },
                        { name: '6. Volver al menú principal', value: 'volver' }
                    ]
                }
            ]);

            switch (opcion) {
                case 'ingreso':
                case 'egreso':
                    await this.crearMovimientoPrompt(opcion);
                    break;
                case 'listar':
                    await this.listarMovimientosPrompt();
                    break;
                case 'filtro_fecha':
                    await this.consultarPorFechaPrompt();
                    break;
                case 'filtro_cliente':
                    await this.consultarPorClientePrompt();
                    break;
                case 'volver':
                    salir = true;
                    break;
            }
        }
    }

    async crearMovimientoPrompt(tipo) {
        try {
            console.log(chalk.yellow(`\n--- Registro de ${tipo.toUpperCase()} (Con Transacción Segura) ---`));

            const categorias = await this.financeService.obtenerCategorias();
            const choicesCategorias = categorias.map(c => ({ name: `${c.id} - ${c.nombre_categoria}`, value: c.id }));
            choicesCategorias.push({ name: 'Registrar nueva categoría', value: 'nueva' });
            const { categoria } = await inquirer.prompt([
                { type: 'select', name: 'categoria', message: 'Seleccione la categoría:', choices: choicesCategorias }
            ]);
            let nombre_categoria;
            if (categoria === 'nueva') {
                const respuesta = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'nombre_categoria',
                        message: 'Ingrese el nombre de la nueva categoría (máx. 50 caracteres):',
                        validate: valor => {
                            const nombre = valor.trim();
                            if (!nombre) return 'El nombre de la categoría es obligatorio.';
                            if (nombre.length > 50) return 'El nombre no puede superar 50 caracteres.';
                            return true;
                        }
                    }
                ]);
                nombre_categoria = respuesta.nombre_categoria;
            }

            const clientes = await this.clientService.listarClientes();
            let cliente_id = null;
            if (clientes.length > 0) {
                const choicesClientes = [
                    { name: '-- General / Sin asociar a cliente --', value: null },
                    ...clientes.map(c => ({ name: `${c.id} - ${c.nombre}`, value: c.id }))
                ];
                const resCliente = await inquirer.prompt([
                    { type: 'select', name: 'cliente_id', message: 'Seleccione el cliente asociado (opcional):', choices: choicesClientes }
                ]);
                cliente_id = resCliente.cliente_id;
            }

            const inputs = await inquirer.prompt([
                { type: 'input', name: 'monto', message: 'Ingrese el monto exacto (ej. 150.00):' },
                { type: 'input', name: 'descripcion', message: 'Descripción o notas adicionales (opcional):' }
            ]);

            // Llamada al servicio que ejecuta la transacción real con control de commit/rollback
            await this.financeService.registrarMovimientoConTransaccion({
                tipo,
                categoria: nombre_categoria ? undefined : categoria,
                nombre_categoria,
                monto: parseFloat(inputs.monto),
                cliente_id,
                descripcion: inputs.descripcion
            });

            console.log(chalk.green(`\n✅ ¡${tipo.charAt(0).toUpperCase() + tipo.slice(1)} registrado y transaccionado exitosamente!`));
        } catch (error) {
            console.log(chalk.red(`\n❌ Error: ${error.message}`));
        }
        await inquirer.prompt([{ type: 'input', name: 'continuar', message: 'Presiona Enter para continuar...' }]);
    }

    async listarMovimientosPrompt() {
        try {
            const movimientos = await this.financeService.obtenerMovimientos();
            if (movimientos.length === 0) {
                console.log(chalk.yellow('\n⚠️ No hay movimientos financieros registrados.'));
            } else {
                console.log(chalk.cyan('\n--- Historial Completo de Movimientos Financieros ---'));
                console.table(movimientos);
            }
        } catch (error) {
            console.log(chalk.red(`\n❌ Error al obtener movimientos: ${error.message}`));
        }
        await inquirer.prompt([{ type: 'input', name: 'continuar', message: 'Presiona Enter para continuar...' }]);
    }

    async consultarPorFechaPrompt() {
        try {
            const { fechaInicio, fechaFin } = await inquirer.prompt([
                { type: 'input', name: 'fechaInicio', message: 'Ingrese fecha de inicio (YYYY-MM-DD):' },
                { type: 'input', name: 'fechaFin', message: 'Ingrese fecha de fin (YYYY-MM-DD):' }
            ]);

            const resultados = await this.financeService.obtenerBalancePorFecha(fechaInicio, fechaFin);
            if (resultados.length === 0) {
                console.log(chalk.yellow('\n⚠️ No se encontraron movimientos en ese rango de fechas.'));
            } else {
                console.log(chalk.cyan(`\n--- Balance Financiero (${fechaInicio} a ${fechaFin}) ---`));
                console.table(resultados);
            }
        } catch (error) {
            console.log(chalk.red(`\n❌ Error en consulta: ${error.message}`));
        }
        await inquirer.prompt([{ type: 'input', name: 'continuar', message: 'Presiona Enter para continuar...' }]);
    }

    async consultarPorClientePrompt() {
        try {
            const clientes = await this.clientService.listarClientes();
            if (clientes.length === 0) {
                console.log(chalk.yellow('\n⚠️ No hay clientes registrados.'));
                await inquirer.prompt([{ type: 'input', name: 'cont', message: 'Presiona Enter para continuar...' }]);
                return;
            }

            const choicesClientes = clientes.map(c => ({ name: `${c.id} - ${c.nombre}`, value: c.id }));
            const { cliente_id } = await inquirer.prompt([
                { type: 'select', name: 'cliente_id', message: 'Seleccione el cliente para ver su balance:', choices: choicesClientes }
            ]);

            const resultados = await this.financeService.obtenerBalancePorCliente(cliente_id);
            if (resultados.length === 0) {
                console.log(chalk.yellow('\n⚠️ El cliente seleccionado no registra movimientos financieros.'));
            } else {
                console.log(chalk.cyan('\n--- Balance Financiero por Cliente ---'));
                console.table(resultados);
            }
        } catch (error) {
            console.log(chalk.red(`\n❌ Error en consulta: ${error.message}`));
        }
        await inquirer.prompt([{ type: 'input', name: 'continuar', message: 'Presiona Enter para continuar...' }]);
    }
}