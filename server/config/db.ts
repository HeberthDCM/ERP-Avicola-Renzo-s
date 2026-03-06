import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const dbPath = path.resolve('database.sqlite');
const db = new Database(dbPath);

export const initDb = () => {
    // Create tables if they don't exist (SQLite version)
    db.exec(`
        CREATE TABLE IF NOT EXISTS roles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL UNIQUE,
            descripcion TEXT
        );

        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            nombre_completo TEXT NOT NULL,
            email TEXT,
            rol_id INTEGER,
            activo INTEGER DEFAULT 1,
            fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (rol_id) REFERENCES roles(id)
        );

        CREATE TABLE IF NOT EXISTS modulos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL UNIQUE,
            label TEXT NOT NULL,
            icono TEXT,
            ruta TEXT NOT NULL,
            activo INTEGER DEFAULT 1,
            orden INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS permisos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            rol_id INTEGER,
            modulo_id INTEGER,
            can_view INTEGER DEFAULT 0,
            can_create INTEGER DEFAULT 0,
            can_edit INTEGER DEFAULT 0,
            can_delete INTEGER DEFAULT 0,
            FOREIGN KEY (rol_id) REFERENCES roles(id),
            FOREIGN KEY (modulo_id) REFERENCES modulos(id)
        );

        CREATE TABLE IF NOT EXISTS auditoria (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER,
            accion TEXT NOT NULL,
            modulo TEXT,
            detalles TEXT,
            fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
            ip_address TEXT,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        );

        CREATE TABLE IF NOT EXISTS caja (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tipo TEXT NOT NULL,
            monto REAL NOT NULL,
            descripcion TEXT,
            usuario_id INTEGER,
            fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        );

        CREATE TABLE IF NOT EXISTS kardex_bandejas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tipo TEXT NOT NULL,
            cantidad INTEGER NOT NULL,
            descripcion TEXT,
            fecha DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS asistencia (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER,
            fecha TEXT NOT NULL,
            hora_entrada TEXT,
            hora_salida TEXT,
            estado TEXT DEFAULT 'PRESENTE',
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        );

        CREATE TABLE IF NOT EXISTS pagos_personal (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER,
            monto REAL NOT NULL,
            fecha_pago TEXT NOT NULL,
            estado TEXT DEFAULT 'PENDIENTE',
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        );
    `);

    // Seed initial data if empty
    const rolesCount = db.prepare('SELECT COUNT(*) as count FROM roles').get() as { count: number };
    if (rolesCount.count === 0) {
        db.prepare("INSERT INTO roles (nombre, descripcion) VALUES (?, ?)").run('Admin', 'Administrador total');
        db.prepare("INSERT INTO roles (nombre, descripcion) VALUES (?, ?)").run('Supervisor', 'Supervisor');
        db.prepare("INSERT INTO roles (nombre, descripcion) VALUES (?, ?)").run('Operador', 'Operador');

        const hashedPassword = bcrypt.hashSync('admin123', 10);
        db.prepare("INSERT INTO usuarios (username, password, nombre_completo, email, rol_id) VALUES (?, ?, ?, ?, ?)")
          .run('admin', hashedPassword, 'Administrador Sistema', 'admin@renzos.com', 1);

        db.prepare("INSERT INTO modulos (nombre, label, icono, ruta, orden) VALUES (?, ?, ?, ?, ?)")
          .run('dashboard', 'Dashboard', 'Dashboard', '/dashboard', 1);
        db.prepare("INSERT INTO modulos (nombre, label, icono, ruta, orden) VALUES (?, ?, ?, ?, ?)")
          .run('caja', 'Caja', 'AccountBalanceWallet', '/caja', 2);
        db.prepare("INSERT INTO modulos (nombre, label, icono, ruta, orden) VALUES (?, ?, ?, ?, ?)")
          .run('kardex', 'Kardex Bandejas', 'Inventory', '/kardex', 3);
        db.prepare("INSERT INTO modulos (nombre, label, icono, ruta, orden) VALUES (?, ?, ?, ?, ?)")
          .run('asistencia', 'Asistencia', 'EventAvailable', '/asistencia', 4);
        db.prepare("INSERT INTO modulos (nombre, label, icono, ruta, orden) VALUES (?, ?, ?, ?, ?)")
          .run('pagos', 'Pagos Personal', 'Payments', '/pagos', 5);
        db.prepare("INSERT INTO modulos (nombre, label, icono, ruta, orden) VALUES (?, ?, ?, ?, ?)")
          .run('usuarios', 'Usuarios', 'People', '/usuarios', 6);

        // Permissions for Admin
        const modulos = db.prepare('SELECT id FROM modulos').all() as { id: number }[];
        const insertPermiso = db.prepare('INSERT INTO permisos (rol_id, modulo_id, can_view, can_create, can_edit, can_delete) VALUES (?, ?, 1, 1, 1, 1)');
        modulos.forEach(m => insertPermiso.run(1, m.id));
        
        // Seed some dashboard data
        db.prepare("INSERT INTO caja (tipo, monto, descripcion, usuario_id) VALUES (?, ?, ?, ?)")
          .run('INGRESO', 5000.00, 'Saldo inicial', 1);
    }
};

export default db;
