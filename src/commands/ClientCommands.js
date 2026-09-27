import { Cliente } from "../models/clientes.js";
import pool from "../config/database.js";

export async function mostrarMenuCliente(rl) {
    try {
        console.clear();
        console.log("|==============================================|");
        console.log("| ===========      GYM SYSTEM         ========= |");
        console.log("|==============================================|");
        console.log('1. Registrar nuevo cliente');
        console.log('2. Volver al menú principal');

        const opcion = await rl.question('\nSelecciona una opcion: ');

        switch (opcion.trim()) {
            case '1':
                await registrarCliente(rl);
                break;
            case '2':
                return; 
            default:
                console.log('Opción no válida.');
        }
    } catch (error) {
        console.log('Ha ocurrido un error:', error.message);
    }
}

async function registrarCliente(rl) {
    console.log('\n--- REGISTRAR NUEVO CLIENTE ---');

    const id = await rl.question('Número de documento (ID): ');
    const tipo_documento = await rl.question('Tipo de documento (Ej: CC, DNI, Pasaporte): ');
    const nombre = await rl.question('Nombre completo: ');
    const edad = await rl.question('Edad: ');
    const correo = await rl.question('Correo electrónico: ');
    const telefono = await rl.question('Teléfono: ');

    try {
        const nuevoCliente = new Cliente(id, tipo_documento, nombre, parseInt(edad), correo, telefono);
        
        // Ejemplo de inserción en la base de datos:
        const query = `INSERT INTO clientes (id, tipo_documento, nombre, edad, correo, telefono) VALUES (?, ?, ?, ?, ?, ?)`;
        await pool.query(query, [id, tipo_documento, nombre, parseInt(edad), correo, telefono]);

        console.log('\n¡Cliente registrado y guardado en la base de datos correctamente!');
    } catch (error) {
        console.error('Error al guardar el cliente:', error.message);
    }
}