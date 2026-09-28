
export class Cliente {
    #id;
    #tipo_documento;
    #nombre;
    #edad;
    #correo;
    #telefono;

    constructor(id, tipo_documento, nombre, edad, correo, telefono) {
        this.#id = id;
        this.#tipo_documento = tipo_documento;
        this.#nombre = nombre;
        this.#edad = edad;
        this.#correo = correo;
        this.#telefono = telefono;
    }

    get id() { return this.#id; }
    get correo() { return this.#correo; }
    get telefono() { return this.#telefono; }

    set correo(nuevoCorreo) {
        if (!nuevoCorreo.includes('@')) {
            console.error('Correo inválido');
            return;
        }
        this.#correo = nuevoCorreo;
    }

    set telefono(nuevoTelefono) {
        if (nuevoTelefono.trim() === '') {
            console.error('El teléfono no puede estar vacío');
            return;
        }
        this.#telefono = nuevoTelefono;
    }
}

