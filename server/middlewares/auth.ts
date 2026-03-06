import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'renzos_secret_key_2025';

export interface AuthRequest extends Request {
    user?: {
        id: number;
        username: string;
        rol_id: number;
        nombre: string;
    };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Token no proporcionado' });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) return res.status(403).json({ message: 'Token inválido o expirado' });
        req.user = user;
        next();
    });
};

export const authorizeRole = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        // En una implementación real, buscaríamos el nombre del rol en la DB
        // Para este MVP, asumimos que el rol_id 1 es Admin
        if (req.user?.rol_id === 1) return next();
        
        // Lógica de autorización por rol más compleja aquí
        next();
    };
};
