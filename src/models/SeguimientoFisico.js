export class SeguimientoFisico {
    constructor(cliente_id, fecha_registro, peso, grasa_corporal, medidas_json, foto_ruta, comentarios) {
        this.cliente_id = parseInt(cliente_id);
        this.fecha_registro = fecha_registro;
        this.peso = parseFloat(peso);
        this.grasa_corporal = grasa_corporal ? parseFloat(grasa_corporal) : null;
        this.medidas_json = medidas_json ? (typeof medidas_json === 'string' ? medidas_json : JSON.stringify(medidas_json)) : null;
        this.foto_ruta = foto_ruta || null;
        this.comentarios = comentarios || null;
        this.validate();
    }

    validate() {
        if (!this.cliente_id || isNaN(this.cliente_id)) {
            throw new Error('El ID del cliente es obligatorio y debe ser válido.');
        }
        if (!this.fecha_registro || this.fecha_registro.trim() === '') {
            throw new Error('La fecha de registro es obligatoria.');
        }
        if (isNaN(this.peso) || this.peso <= 0) {
            throw new Error('El peso debe ser un número mayor a 0.');
        }
    }

    toPlainObject() {
        return {
            cliente_id: this.cliente_id,
            fecha_registro: this.fecha_registro,
            peso: this.peso,
            grasa_corporal: this.grasa_corporal,
            medidas_json: this.medidas_json,
            foto_ruta: this.foto_ruta,
            comentarios: this.comentarios
        };
    }
}