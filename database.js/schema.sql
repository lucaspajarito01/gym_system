DROP DATABASE IF EXISTS gym_system;

CREATE DATABASE IF NOT EXISTS gym_system;
USE gym_system;


CREATE TABLE tipo_documentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tipo VARCHAR(10)
);

CREATE TABLE clientes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tipo_documento INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    edad INT NOT NULL,
    correo VARCHAR(60) NOT NULL UNIQUE,
    telefono VARCHAR(15) NOT NULL,

    CONSTRAINT fk_documento
        FOREIGN KEY (tipo_documento)
        REFERENCES tipo_documentos(id)
        ON DELETE CASCADE
);


CREATE TABLE plan_entrenamientos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(30) NOT NULL,
    duracion VARCHAR(60) NOT NULL,
    metas_fisicas VARCHAR(150) NOT NULL,
    nivel enum('1', '2', '3', '4', '5')
);

CREATE TABLE contratos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    plan_id INT NOT NULL,
    condiciones text NOT NULL,
    precio DECIMAL(10,2) NOT NULL default 250.00,
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_fin DATE NOT NULL,
    estado VARCHAR(50),
    
    CONSTRAINT fk_cliente_id
        FOREIGN KEY (cliente_id)
        REFERENCES clientes(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_plan_id
        FOREIGN KEY (plan_id)
        REFERENCES plan_entrenamientos(id)
        ON DELETE RESTRICT
);

CREATE TABLE seguimiento_fisico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    fecha_registro DATE NOT NULL,
    peso DECIMAL(5,2) NOT NULL,
    grasa_corporal DECIMAL(5,2),
    medidas_json JSON,
    foto_ruta VARCHAR(555),
    comentarios TEXT,

    FOREIGN KEY (cliente_id)
        REFERENCES clientes(id)
        ON DELETE CASCADE
);
CREATE TABLE planes_nutricion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    plan_entrenamiento_id INT NOT NULL,
    nombre_dieta VARCHAR(100) NOT NULL,

    FOREIGN KEY (cliente_id)
        REFERENCES clientes(id)
        ON DELETE CASCADE,

    FOREIGN KEY (plan_entrenamiento_id)
        REFERENCES plan_entrenamientos(id)
        ON DELETE CASCADE
);

CREATE TABLE alimentos_diarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plan_nutricion_id INT NOT NULL,
    fecha DATE NOT NULL,
    nombre_alimento VARCHAR(150) NOT NULL,
    calorias_estimadas INT NOT NULL,

    FOREIGN KEY (plan_nutricion_id)
        REFERENCES planes_nutricion(id)
        ON DELETE CASCADE
);

CREATE TABLE categoria_servicios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre_categoria VARCHAR(50) NOT NULL
);

CREATE TABLE movimientos_financieros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('ingreso', 'egreso') NOT NULL,
    categoria INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cliente_id INT NULL,
    descripcion TEXT,

    FOREIGN KEY (cliente_id)
        REFERENCES clientes(id)
        ON DELETE SET NULL,

    FOREIGN KEY (categoria)
        REFERENCES categoria_servicios(id)
);

CREATE TABLE attendances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    plan_id INT NOT NULL,
    date DATETIME NOT NULL,
    session_type ENUM('group', 'individual') NOT NULL,
    notes TEXT,
    FOREIGN KEY (client_id) REFERENCES clientes(id),
    FOREIGN KEY (plan_id) REFERENCES plan_entrenamientos(id)
);