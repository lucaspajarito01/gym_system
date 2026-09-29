# 🏋️ Gym Management System

Sistema CLI desarrollado con **Node.js, JavaScript (ESM) y MySQL** para la gestión de clientes, planes, contratos, seguimiento físico, nutrición y finanzas.

## 📦 Instalación y uso

```bash
git clone <url-del-repositorio>
cd gym_system
npm install
```

Configurar el archivo `.env`:

```env
DB_HOST=localhost
DB_USER=usuario
DB_PASSWORD=contraseña
DB_NAME=gym_system
```

Ejecutar la base de datos mediante el script SQL y posteriormente iniciar:

```bash
node app.js
```

## 📂 Estructura

```text
gym_system/
│
├── src/                          # Directorio principal del código fuente
│   ├── commands/                 # Capa de Interfaz de Usuario (CLI / Terminal)
│   │   ├── ClientCommand.js      # Interfaz de consola para capturar y mostrar opciones de clientes.[cite: 6]
│   │   ├── FinanceCommand.js     # Menú interactivo de consola para gestión de ingresos y egresos.[cite: 6]
│   │   ├── MainMenu.js           # Menú principal global que redirige a los diferentes módulos de la app.[cite: 6]
│   │   ├── NutritionCommand.js   # Interfaz de consola para la asignación y control de nutrición.[cite: 6]
│   │   ├── PlanCommand.js        # Interfaz de consola para administrar planes de entrenamiento.[cite: 6]
│   │   └── SeguimientoCommand.js # Interfaz de consola para registrar y consultar medidas físicas.[cite: 6]
│   ├── config/                   # Configuración del sistema y conexiones externas
│   │   └── database.js           # Inicializa el pool de conexiones a MySQL usando dotenv.[cite: 6]
│   ├── img/                      # Recursos visuales y diagramas
│   │   └── Diagrama_DML.png      # Diagrama de la base de datos relacional (DML).[cite: 6]
│   ├── models/                   # Capa de dominio orientada a objetos
│   │   ├── Client.js             # Clase modelo de clientes con lógica de autovalidación.[cite: 6]
│   │   ├── Plan.js               # Clase modelo para definir la estructura de los planes.[cite: 6]
│   │   └── SeguimientoFisico.js  # Clase modelo que encapsula los datos de seguimiento físico.[cite: 6]
│   ├── repositories/             # Capa de persistencia (Consultas SQL puras)
│   │   ├── ClientRepository.js   # Ejecuta consultas SQL para crear, leer y actualizar clientes.[cite: 6]
│   │   ├── ContractRepository.js # Gestiona la persistencia de contratos en la base de datos.[cite: 6]
│   │   ├── FinanceRepository.js  # Centraliza las transacciones y consultas financieras en SQL.[cite: 6]
│   │   ├── NutritionRepository.js# Consultas SQL para el módulo de nutrición.[cite: 6]
│   │   ├── PlanRepository.js     # Persistencia de planes de entrenamiento en MySQL.[cite: 6]
│   │   └── SeguimientoRepository.js# Consultas SQL para almacenar el historial de medidas corporales.[cite: 6]
│   └── services/                 # Capa de lógica de negocio
│       ├── ClientService.js      # Valida reglas de negocio antes de persistir clientes.[cite: 7]
│       ├── ContractService.js    # Lógica de negocio para la contratación de planes.[cite: 7]
│       ├── FinanceService.js     # Controla las reglas financieras y transacciones ACID.[cite: 7]
│       ├── NutritionService.js   # Procesa la lógica de asignación nutricional.[cite: 7]
│       ├── PlanService.js        # Reglas de negocio vinculadas a los planes de entrenamiento.[cite: 7]
│       └── SeguimientoService.js # Lógica de procesamiento de avances físicos de los clientes.[cite: 7]
│
├── videos/                       # Archivos multimedia de demostración
│   └── Video_de_presentación.mp4 # Video explicativo o de presentación del proyecto.[cite: 7]
├── .env                          # Variables de entorno secretas (Credenciales de base de datos).[cite: 7]
├── .gitignore                    # Archivos y carpetas ignorados por el control de versiones Git.[cite: 7]
├── app.js                        # Punto de entrada principal y manejador de errores global.[cite: 7]
├── package-lock.json             # Registro detallado de versiones exactas de las dependencias.[cite: 7]
├── package.json                  # Configuración de dependencias, scripts y metadatos del proyecto.[cite: 7]
└── README.md                     # Documentación general, instrucciones y detalles del sistema.[cite: 7]
```

## 📐 SOLID

* **SRP:** separación de responsabilidades entre comandos, servicios y repositorios.
* **OCP:** estructura preparada para agregar nuevas funcionalidades.
* **DIP:** servicios desacoplados de la conexión directa a la base de datos.

## 🎨 Patrones utilizados

* **Layered Architecture:** `commands → services → repositories`.
* **Connection Pooling:** gestión de conexiones mediante `mysql2`.
* **Domain Validation:** validación de datos dentro de los modelos.

## ⚙️ Consideraciones técnicas

* Transacciones **ACID** mediante `BEGIN`, `COMMIT` y `ROLLBACK`.
* Consultas SQL parametrizadas para prevenir SQL Injection.
* Variables de entorno mediante `dotenv`.
* Manejo de errores en la aplicación.

## 👤 Créditos

**Desarrollador:** Lucas Samuel Pajarito Surek

**Proyecto:** Sistema de Gestión de Gimnasio — Node.js & MySQL
