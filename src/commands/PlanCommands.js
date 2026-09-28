import { PlanEntrenamiento } from "../models/PlanEntrenamiento.js";
import pool from "../config/database.js";

export async function mostrarMenuPlanes(rl) {
    let volver = false;

    while (!volver) {
        console.clear();
        console.log("|==============================================|");
        console.log("| ======= GESTIÓN DE PLANES Y CONTRATOS ====== |");
        console.log("|==============================================|");
        console.log('1. Crear nuevo plan de entrenamiento');
        console.log('2. Listar planes de entrenamiento');
        console.log('3. Asignar plan a cliente (Registrar contrato)');
        console.log('4. Gestionar contrato (Renovar / Cancelar / Finalizar)');
        console.log('5. Volver al menú principal');

        const opcion = await rl.question('\nSelecciona una opcion: ');

        switch (opcion.trim()) {
            case '1':
                await crearPlan(rl);
                await rl.question('\nPresiona Enter para continuar...');
                break;

            case '2':
                await listarPlanes();
                await rl.question('\nPresiona Enter para continuar...');
                break;

            case '3':
                await asignarPlanCliente(rl);
                await rl.question('\nPresiona Enter para continuar...');
                break;

            case '4':
                await gestionarContrato(rl);
                await rl.question('\nPresiona Enter para continuar...');
                break;

            case '5':
                volver = true;
                break;

            default:
                console.log('\nOpción no válida.');
                await rl.question('\nPresiona Enter para continuar...');
        }
    }
}

// Crear un plan
async function crearPlan(rl) {
    console.log('\n--- CREAR PLAN DE ENTRENAMIENTO ---');
    const nombre = await rl.question('Nombre del plan: ');
    const duracion = await rl.question('Duración (Ej: 1 mes, 3 meses): ');
    const metas_fisicas = await rl.question('Metas físicas (Ej: Hipertrofia, Pérdida de peso): ');
    
    console.log('Nivel disponible: 1. Principiante | 2. Intermedio | 3. Avanzado');
    const opcionNivel = await rl.question('Selecciona el nivel (1-3): ');
    
    let nivel = 'Principiante';
    if (opcionNivel === '2') nivel = 'Intermedio';
    if (opcionNivel === '3') nivel = 'Avanzado';

    try {
        const query = `INSERT INTO plan_entrenamientos (nombre, duracion, metas_fisicas, nivel) VALUES (?, ?, ?, ?)`;
        await pool.query(query, [nombre, duracion, metas_fisicas, nivel]);
        console.log('\n✅ ¡Plan de entrenamiento creado exitosamente!');
    } catch (error) {
        console.error('Error al crear el plan:', error.message);
    }
}

// Listar planes
async function listarPlanes() {
    console.log('\n--- LISTA DE PLANES DE ENTRENAMIENTO ---');
    try {
        const [rows] = await pool.query('SELECT * FROM plan_entrenamientos');
        if (rows.length === 0) {
            console.log('No hay planes registrados.');
        } else {
            console.table(rows);
        }
    } catch (error) {
        console.error('Error al listar planes:', error.message);
    }
}

async function asignarPlanCliente(rl) {
    console.log('\n--- ASIGNAR PLAN A CLIENTE (CONTRATO) ---');
    const clienteId = await rl.question('Ingrese el ID (documento) del cliente: ');
    
    // Verificamos si existe el cliente
    const [clienteRows] = await pool.query('SELECT * FROM clientes WHERE id = ?', [clienteId]);
    if (clienteRows.length === 0) {
        console.log('\n❌ Cliente no encontrado.');
        return;
    }

    await listarPlanes();
    const planId = await rl.question('\nIngrese el ID del plan de entrenamiento a asignar: ');

    // Verificamos si existe el plan
    const [planRows] = await pool.query('SELECT * FROM plan_entrenamientos WHERE id = ?', [planId]);
    if (planRows.length === 0) {
        console.log('\n❌ Plan no encontrado.');
        return;
    }

    const condiciones = await rl.question('Ingrese las condiciones del contrato: ');
    const precio = await rl.question('Ingrese el precio del contrato: ');
    const fecha_inicio = await rl.question('Ingese la fecha de inicio:');
    const fechaFin = await rl.question('Ingese la fecha de finalización:');
    const inputFechaFin = await rl.question('Ingrese la fecha de finalización (YYYY-MM-DD) o presione Enter para dejar sin fecha: ');
    const fecha_fin = inputFechaFin.trim() !== '' ? inputFechaFin : null;

    try {

const query = `
    INSERT INTO contratos (cliente_id, plan_id, fecha_inicio, fecha_fin, estado, condiciones, precio) 
    VALUES (?, ?, NOW(), ?, 'activo', ?, ?)
`;
await pool.query(query, [clienteId, planId, fecha_fin, condiciones, precio]);
        console.log('\n✅ ¡Contrato registrado y plan asignado correctamente al cliente!');
    } catch (error) {
        console.error('Error al registrar el contrato:', error.message);
    }
}

// 4. Gestionar contrato (Renovar, cancelar, finalizar)
async function gestionarContrato(rl) {
    console.log('\n--- GESTIÓN DE CONTRATOS ---');
    const contratoId = await rl.question('Ingrese el ID del contrato a modificar: ');

    const [rows] = await pool.query('SELECT * FROM contratos WHERE id = ?', [contratoId]);
    if (rows.length === 0) {
        console.log('\n❌ Contrato no encontrado.');
        return;
    }

    console.log('\nContrato actual:');
    console.table(rows);

    console.log('\n¿Qué acción desea realizar?');
    console.log('1. Renovar plan');
    console.log('2. Cancelar plan');
    console.log('3. Finalizar plan');
    
    const accion = await rl.question('Seleccione una opción (1-3): ');
    let nuevoEstado = '';

    switch (accion.trim()) {
        case '1': nuevoEstado = 'renovado'; break;
        case '2': nuevoEstado = 'cancelado'; break;
        case '3': nuevoEstado = 'finalizado'; break;
        default:
            console.log('Opción inválida.');
            return;
    }

    try {
        await pool.query('UPDATE contratos SET estado = ? WHERE id = ?', [nuevoEstado, contratoId]);
        console.log(`\n✅ ¡Contrato actualizado a estado: ${nuevoEstado} exitosamente!`);
    } catch (error) {
        console.error('Error al actualizar el contrato:', error.message);
    }
}