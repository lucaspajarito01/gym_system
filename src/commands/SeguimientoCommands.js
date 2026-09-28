import pool from "../config/database.js";

export async function mostrarMenuSeguimiento(rl) {
    let volver = false;

    while (!volver) {
        console.clear();
        console.log("|==============================================|");
        console.log("| ========= SEGUIMIENTO FÍSICO Y AVANCES ====== |");
        console.log("|==============================================|");
        console.log('1. Registrar avance semanal');
        console.log('2. Visualizar progreso cronológico de un cliente');
        console.log('3. Eliminar registro de avance (con validación/rollback)');
        console.log('4. Volver al menú principal');

        const opcion = await rl.question('\nSelecciona una opcion: ');

        switch (opcion.trim()) {
            case '1':
                await registrarAvance(rl);
                await rl.question('\nPresiona Enter para continuar...');
                break;

            case '2':
                await visualizarProgreso(rl);
                await rl.question('\nPresiona Enter para continuar...');
                break;

            case '3':
                await eliminarAvanceSeguro(rl);
                await rl.question('\nPresiona Enter para continuar...');
                break;

            case '4':
                volver = true;
                break;

            default:
                console.log('\nOpción no válida.');
                await rl.question('\nPresiona Enter para continuar...');
        }
    }
}

// 1. Registrar avance semanal
async function registrarAvance(rl) {
    console.log('\n--- REGISTRAR AVANCE SEMANAL ---');
    const clienteId = await rl.question('Ingrese el ID (documento) del cliente: ');

    // Verificar si el cliente existe
    const [clienteRows] = await pool.query('SELECT * FROM clientes WHERE id = ?', [clienteId]);
    if (clienteRows.length === 0) {
        console.log('\n❌ Cliente no encontrado.');
        return;
    }

    const peso = await rl.question('Peso actual (kg): ');
    const grasa = await rl.question('Porcentaje de grasa corporal (%): ');
    const medidasTexto = await rl.question('Medidas (Ej: 95, 80, 60): ');
    const medidasJson = JSON.stringify({ descripcion: medidasTexto });
    const foto = await rl.question('Ruta o enlace de la foto de progreso: ');
    const comentarios = await rl.question('Comentarios u observaciones: ');
    

    try {
        const query = `
            INSERT INTO seguimiento_fisico (cliente_id, fecha_registro, peso, grasa_corporal, medidas_json, foto_ruta, comentarios) 
            VALUES (?, NOW(), ?, ?, ?, ?, ?)
        `;
        await pool.query(query, [clienteId, parseFloat(peso), parseFloat(grasa), medidasJson, foto, comentarios]);
        console.log('\n✅ ¡Avance físico registrado exitosamente!');
    } catch (error) {
        console.error('Error al registrar el avance:', error.message);
    }
}

// 2. Visualizar progreso cronológico
async function visualizarProgreso(rl) {
    console.log('\n--- HISTORIAL DE PROGRESO CRONOLÓGICO ---');
    const clienteId = await rl.question('Ingrese el ID del cliente: ');

    try {
        const query = `
            SELECT id, DATE_FORMAT(fecha_registro, '%Y-%m-%d') AS fecha, peso, grasa_corporal, medidas_json, foto_ruta, comentarios 
            FROM seguimiento_fisico 
            WHERE cliente_id = ? 
            ORDER BY fecha ASC
        `;
        const [rows] = await pool.query(query, [clienteId]);

        if (rows.length === 0) {
            console.log('\n❌ No hay registros de seguimiento para este cliente.');
        } else {
            console.log(`\nMostrando historial para el cliente ID: ${clienteId}`);
            console.table(rows);
        }
    } catch (error) {
        console.error('Error al obtener el progreso:', error.message);
    }
}

// 3. Eliminar registro con Transacción y Rollback
async function eliminarAvanceSeguro(rl) {
    console.log('\n--- ELIMINAR REGISTRO DE AVANCE ---');
    const avanceId = await rl.question('Ingrese el ID del registro de seguimiento a eliminar: ');

    // Obtenemos una conexión exclusiva del pool para manejar transacciones
    const connection = await pool.getConnection();

    try {
        // Iniciamos la transacción
        await connection.beginTransaction();

        // Verificamos si el registro existe
        const [rows] = await connection.query('SELECT * FROM seguimiento_fisico WHERE id = ?', [avanceId]);
        if (rows.length === 0) {
            console.log('\n❌ No se encontró ningún registro con ese ID.');
            connection.release();
            return;
        }

        console.log('\nRegistro encontrado:');
        console.table(rows);

        const confirmar = await rl.question('¿Estás seguro de eliminar este registro? (s/n): ');
        if (confirmar.trim().toLowerCase() !== 's') {
            console.log('\n⚠️ Operación cancelada.');
            await connection.rollback(); // Cancelamos transacción si no se confirma
            connection.release();
            return;
        }

        // Ejecutamos la eliminación
        await connection.query('DELETE FROM seguimiento_fisico WHERE id = ?', [avanceId]);

        // Confirmamos los cambios permanentemente
        await connection.commit();
        console.log('\n✅ ¡Registro eliminado correctamente!');

    } catch (error) {
        // Si ocurre cualquier error imprevisto, revertimos cambios con rollback
        await connection.rollback();
        console.error('❌ Error crítico en la operación. Se aplicó Rollback:', error.message);
    } finally {
        // Liberamos siempre la conexión
        connection.release();
    }
}