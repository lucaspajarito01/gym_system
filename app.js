import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import pool from './src/config/database.js';

const rl = readline.createInterface({ input, output });

async function main() {
    try {
        const connection = await pool.getConnection();
        console.log('¡Conexión exitosa a la base de datos desde app.js!');
        connection.release(); 

        mostrarMenu();
        const opcion = await rl.question('\nSelecciona una opcion: ');

        switch(opcion.trim()){
            case '1':
        }

    } catch (error) {
        console.error('Error al conectar a la base de datos:', error.message);
    }
}

main();
async function mostrarMenu() {
    console.clear();
    console.log("|==============================================|")
    console.log("| ===========      GYM SYSTEM        ========= |")
    console.log("|==============================================|")
    console.log(' 1. Gestionar Usuarios.')
    console.log(' 2. Gestion de planes_Entrenamiento.')
};

main();