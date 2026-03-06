-- Script para MySQL (Producción)
-- Empresa: Avícola Renzo's

CREATE DATABASE IF NOT EXISTS erp_avicola;
USE erp_avicola;

-- Tabla de Roles
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT
);

-- Tabla de Usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    rol_id INT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(id)
);

-- Tabla de Módulos
CREATE TABLE modulos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    label VARCHAR(100) NOT NULL,
    icono VARCHAR(50),
    ruta VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    orden INT DEFAULT 0
);

-- Tabla de Permisos
-- Acciones: ver, crear, editar, eliminar
CREATE TABLE permisos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rol_id INT,
    modulo_id INT,
    can_view BOOLEAN DEFAULT FALSE,
    can_create BOOLEAN DEFAULT FALSE,
    can_edit BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (rol_id) REFERENCES roles(id),
    FOREIGN KEY (modulo_id) REFERENCES modulos(id)
);

-- Tabla de Auditoría
CREATE TABLE auditoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    accion VARCHAR(50) NOT NULL, -- LOGIN, INSERT, UPDATE, DELETE
    modulo VARCHAR(50),
    detalles TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tablas de Negocio (Ejemplos)

-- Caja
CREATE TABLE caja (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('INGRESO', 'EGRESO') NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    descripcion TEXT,
    usuario_id INT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Kardex de Bandejas
CREATE TABLE kardex_bandejas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('ENTRADA', 'SALIDA') NOT NULL,
    cantidad INT NOT NULL,
    descripcion TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Control de Asistencia
CREATE TABLE asistencia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    fecha DATE NOT NULL,
    hora_entrada TIME,
    hora_salida TIME,
    estado ENUM('PRESENTE', 'FALTA', 'TARDANZA') DEFAULT 'PRESENTE',
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Pagos de Personal
CREATE TABLE pagos_personal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    monto DECIMAL(10, 2) NOT NULL,
    fecha_pago DATE NOT NULL,
    estado ENUM('PENDIENTE', 'PAGADO') DEFAULT 'PENDIENTE',
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Datos Iniciales
INSERT INTO roles (nombre, descripcion) VALUES ('Admin', 'Administrador total del sistema');
INSERT INTO roles (nombre, descripcion) VALUES ('Supervisor', 'Supervisión de operaciones');
INSERT INTO roles (nombre, descripcion) VALUES ('Operador', 'Operaciones básicas');

INSERT INTO modulos (nombre, label, icono, ruta, orden) VALUES 
('dashboard', 'Dashboard', 'Dashboard', '/dashboard', 1),
('caja', 'Caja', 'AccountBalanceWallet', '/caja', 2),
('kardex', 'Kardex Bandejas', 'Inventory', '/kardex', 3),
('asistencia', 'Asistencia', 'EventAvailable', '/asistencia', 4),
('pagos', 'Pagos Personal', 'Payments', '/pagos', 5),
('usuarios', 'Usuarios', 'People', '/usuarios', 6);

-- Permisos para Admin (ID 1) en todos los módulos
INSERT INTO permisos (rol_id, modulo_id, can_view, can_create, can_edit, can_delete)
SELECT 1, id, 1, 1, 1, 1 FROM modulos;
