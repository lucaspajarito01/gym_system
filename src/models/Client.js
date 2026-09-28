export class Client {
    constructor(tipo_documento, nombre, edad, correo, telefono) {
        this.tipo_documento = tipo_documento;
        this.nombre = nombre;
        this.edad = edad;
        this.correo = correo;
        this.telefono = telefono;
        this.validate();
    }

    validate() {
        if (!this.tipo_documento) {
            throw new Error('El tipo de documento es obligatorio.');
        }
        if (!this.nombre || this.nombre.trim().length < 3) {
            throw new Error('El nombre debe tener al menos 3 caracteres.');
        }
        if (!this.edad || isNaN(this.edad) || this.edad <= 0) {
            throw new Error('La edad debe ser un número válido.');
        }
        if (!this.correo || !this.correo.includes('@')) {
            throw new Error('El correo electrónico no es válido.');
        }
        if (!this.telefono) {
            throw new Error('El teléfono es obligatorio.');
        }
    }

    toPlainObject() {
        return {
            tipo_documento: this.tipo_documento,
            nombre: this.nombre,
            edad: this.edad,
            correo: this.correo,
            telefono: this.telefono
        };
    }
}