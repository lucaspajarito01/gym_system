export class Plan {
    constructor(nombre, duracion, metas_fisicas, nivel) {
        this.nombre = nombre;
        this.duracion = duracion;
        this.metas_fisicas = metas_fisicas;
        this.nivel = String(nivel);
        this.validate();
    }

    validate() {
        if (!this.nombre || this.nombre.trim().length < 3) {
            throw new Error('El nombre del plan debe tener al menos 3 caracteres.');
        }
        if (!this.duracion || this.duracion.trim() === '') {
            throw new Error('La duración es obligatoria.');
        }
        if (!this.metas_fisicas || this.metas_fisicas.trim() === '') {
            throw new Error('Las metas físicas son obligatorias.');
        }
        const nivelesValidos = ['1', '2', '3', '4', '5'];
        if (!nivelesValidos.includes(this.nivel)) {
            throw new Error('El nivel debe ser un valor entre 1 y 5.');
        }
    }

    toPlainObject() {
        return {
            nombre: this.nombre,
            duracion: this.duracion,
            metas_fisicas: this.metas_fisicas,
            nivel: this.nivel
        };
    }
}