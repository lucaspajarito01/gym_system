export class PlanEntrenamiento {
    #id;
    #nombre;
    #duracion;
    #metas_fisicas;
    #nivel;

    constructor(id, nombre, duracion, metas_fisicas, nivel) {
        this.#id = id;
        this.#nombre = nombre;
        this.#duracion = duracion;
        this.#metas_fisicas = metas_fisicas;
        this.#nivel = nivel;
    }

    // Getters
    get id() { return this.#id; }
    get nombre() { return this.#nombre; }
    get duracion() { return this.#duracion; }
    get metas_fisicas() { return this.#metas_fisicas; }
    get nivel() { return this.#nivel; }
}