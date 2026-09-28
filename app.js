import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import pool from './src/config/database.js';
import { mostrarMenuPlanes } from './src/commands/PlanCommands.js';
import { mostrarMenuCliente } from './src/commands/ClientCommands.js';
import { mostrarMenuSeguimiento } from './src/commands/SeguimientoCommands.js';

// Única instancia de readline para toda la aplicación
const rl = readline.createInterface({ input, output });

async function main() {
    try {
        // Prueba rápida de conexión
        const connection = await pool.getConnection();
        console.log('¡Conexión exitosa a la base de datos desde app.js!');
        connection.release();

        let salir = false;

        while (!salir) {
            console.clear();
            console.log("|==============================================|");
            console.log("| ===========      GYM SYSTEM         =========|");
            console.log("|==============================================|");
            console.log('1. Gestionar Clientes/Usuarios');
            console.log('2. Gestión de planes de Entrenamiento)');
            console.log('3. Segimiento de Fisico y Avances )');
            console.log('4. Salir');

            const opcion = await rl.question('\nSelecciona una opcion: ');

            switch (opcion.trim()) {
                case '1':
                    await mostrarMenuCliente(rl);
                    break;
                
                case '2':
                    await mostrarMenuPlanes(rl);
                    break;

                case '3':
                    await mostrarMenuSeguimiento(rl);
                    break;

                case '4':
                    console.log('\nSaliendo del sistema...');
                    salir = true;
                break;

                default:
                    console.log('\nOpción no válida.');
                    await rl.question('\nPresiona Enter para continuar...');
            }
        }
    } catch (error) {
        console.error('Error general:', error.message);
    } finally {
        rl.close();
        process.exit(0);
    }
}

main();