import { Cliente } from "../models/clientes.js";
import pool from "../config/database.js";

export async function mostrarMenuCliente(rl) {
    let volver = false;

    while (!volver) {
        console.clear();
        console.log("|==============================================|");
        console.log("| ===========      GYM SYSTEM         ========= |");
        console.log("|==============================================|");
        console.log('1. Registrar nuevo cliente');
        console.log('2. Listar clientes');
        console.log('3. Buscar cliente por ID');
        console.log('4. Eliminar cliente');
        console.log('5. Actualizar cliente'); // Nueva opción
        console.log('6. Volver al menú principal'); // Opción desplazada

        const opcion = await rl.question('\nSelecciona una opcion: ');

        switch (opcion.trim()) {
            case '1':
                await registrarCliente(rl);
                await rl.question('\nPresiona Enter para continuar...');
                break;

            case '2':
                await listarClientes();
                await rl.question('\nPresiona Enter para continuar...');
                break;

            case '3':
                await buscarCliente(rl);
                await rl.question('\nPresiona Enter para continuar...');
                break;

            case '4':
                await eliminarCliente(rl);
                await rl.question('\nPresiona Enter para continuar...');
                break;

            case '5':
                await actualizarCliente(rl); // Llamamos a la nueva función
                await rl.question('\nPresiona Enter para continuar...');
                break;

            case '6':
                volver = true; 
                break;

            default:
                console.log('\nOpción no válida.');
                await rl.question('\nPresiona Enter para continuar...');
        }
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
        const query = `INSERT INTO clientes (id, tipo_documento, nombre, edad, correo, telefono) VALUES (?, ?, ?, ?, ?, ?)`;
        await pool.query(query, [id, tipo_documento, nombre, parseInt(edad), correo, telefono]);

        console.log('\n¡Cliente registrado y guardado en la base de datos correctamente!');
    } catch (error) {
        console.error('\nError al guardar el cliente:', error.message);
    }
}

async function listarClientes() {
    console.log('\n--- LISTA DE CLIENTES REGISTRADOS ---');
    try {
        const [rows] = await pool.query('SELECT * FROM clientes');
        
        if (rows.length === 0) {
            console.log('No hay clientes registrados en la base de datos.');
        } else {
            console.table(rows);
        }
    } catch (error) {
        console.error('Error al obtener los clientes:', error.message);
    }
}

async function buscarCliente(rl) {
    console.log('\n--- BUSCAR CLIENTE ---');
    const idBuscado = await rl.question('Ingrese el número de documento (ID) del cliente: ');

    try {
        const query = 'SELECT * FROM clientes WHERE id = ?';
        const [rows] = await pool.query(query, [idBuscado]);

        if (rows.length === 0) {
            console.log('\n❌ No se encontró ningún cliente con ese número de documento.');
        } else {
            console.log('\n✅ ¡Cliente encontrado!');
            console.table(rows);
        }
    } catch (error) {
        console.error('Error al buscar el cliente:', error.message);
    }
}

async function eliminarCliente(rl) {
    console.log('\n--- ELIMINAR CLIENTE ---');
    const idBuscado = await rl.question('Ingrese el número de documento (ID) del cliente a eliminar: ');

    try {
        const [rows] = await pool.query('SELECT * FROM clientes WHERE id = ?', [idBuscado]);

        if (rows.length === 0) {
            console.log('\n❌ No se encontró ningún cliente con ese ID.');
            return;
        }

        console.log('\nCliente encontrado:');
        console.table(rows);

        const confirmar = await rl.question('¿Estás seguro de que deseas eliminar este cliente? (s/n): ');

        if (confirmar.trim().toLowerCase() === 's') {
            await pool.query('DELETE FROM clientes WHERE id = ?', [idBuscado]);
            console.log('\n✅ ¡Cliente eliminado correctamente de la base de datos!');
        } else {
            console.log('\n⚠️ Operación cancelada.');
        }
    } catch (error) {
        console.error('Error al eliminar el cliente:', error.message);
    }
}

// ✏️ Nueva función para actualizar un cliente
async function actualizarCliente(rl) {
    console.log('\n--- ACTUALIZAR CLIENTE ---');
    const idBuscado = await rl.question('Ingrese el número de documento (ID) del cliente a actualizar: ');

    try {
        // 1. Verificamos que el cliente exista
        const [rows] = await pool.query('SELECT * FROM clientes WHERE id = ?', [idBuscado]);

        if (rows.length === 0) {
            console.log('\n❌ No se encontró ningún cliente con ese ID.');
            return;
        }

        const clienteActual = rows[0];
        console.log('\nDatos actuales del cliente:');
        console.table([clienteActual]);

        console.log('\n(Deje el campo en blanco y presione Enter si desea mantener el valor actual)');

        // 2. Solicitamos los nuevos valores mostrando los actuales como referencia
        const nuevoNombre = await rl.question(`Nombre [${clienteActual.nombre}]: `);
        const nuevaEdad = await rl.question(`Edad [${clienteActual.edad}]: `);
        const nuevoCorreo = await rl.question(`Correo [${clienteActual.correo}]: `);
        const nuevoTelefono = await rl.question(`Teléfono [${clienteActual.telefono}]: `);

        // 3. Validamos si escribió algo nuevo o si mantiene el valor anterior
        const nombreFinal = nuevoNombre.trim() !== '' ? nuevoNombre : clienteActual.nombre;
        const edadFinal = nuevaEdad.trim() !== '' ? parseInt(nuevaEdad) : clienteActual.edad;
        const correoFinal = nuevoCorreo.trim() !== '' ? nuevoCorreo : clienteActual.correo;
        const telefonoFinal = nuevoTelefono.trim() !== '' ? nuevoTelefono : clienteActual.telefono;

        // 4. Ejecutamos la consulta de actualización en la base de datos
        const updateQuery = `
            UPDATE clientes 
            SET nombre = ?, edad = ?, correo = ?, telefono = ? 
            WHERE id = ?
        `;
        await pool.query(updateQuery, [nombreFinal, edadFinal, correoFinal, telefonoFinal, idBuscado]);

        console.log('\n✅ ¡Cliente actualizado correctamente en la base de datos!');

    } catch (error) {
        console.error('Error al actualizar el cliente:', error.message);
    }
}