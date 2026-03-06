import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'renzos_secret_key_2025';

export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    try {
        const user = db.prepare('SELECT u.*, r.nombre as rol_nombre FROM usuarios u JOIN roles r ON u.rol_id = r.id WHERE u.username = ?').get(username) as any;

        if (!user) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, rol_id: user.rol_id, nombre: user.nombre_completo },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Registrar auditoría
        db.prepare('INSERT INTO auditoria (usuario_id, accion, detalles) VALUES (?, ?, ?)')
          .run(user.id, 'LOGIN', `Inicio de sesión exitoso desde IP: ${req.ip}`);

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                nombre: user.nombre_completo,
                rol: user.rol_nombre,
                rol_id: user.rol_id
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

export const getProfile = (req: any, res: Response) => {
    res.json(req.user);
};
