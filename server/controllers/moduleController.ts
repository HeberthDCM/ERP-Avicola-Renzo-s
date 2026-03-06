import { Response } from 'express';
import db from '../config/db.ts';
import { AuthRequest } from '../middlewares/auth.ts';

export const getUserModules = (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const rolId = req.user?.rol_id;

    try {
        // Obtener módulos permitidos para el rol del usuario
        const modules = db.prepare(`
            SELECT m.*, p.can_view, p.can_create, p.can_edit, p.can_delete
            FROM modulos m
            JOIN permisos p ON m.id = p.modulo_id
            WHERE p.rol_id = ? AND m.activo = 1 AND p.can_view = 1
            ORDER BY m.orden ASC
        `).all(rolId);

        res.json(modules);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener módulos' });
    }
};

export const getDashboardStats = (req: AuthRequest, res: Response) => {
    try {
        const cajaTotal = db.prepare("SELECT SUM(CASE WHEN tipo = 'INGRESO' THEN monto ELSE -monto END) as total FROM caja").get() as any;
        const asistenciaHoy = db.prepare("SELECT COUNT(*) as count FROM asistencia WHERE fecha = date('now') AND estado = 'PRESENTE'").get() as any;
        const pagosPendientes = db.prepare("SELECT COUNT(*) as count FROM pagos_personal WHERE estado = 'PENDIENTE'").get() as any;
        
        const actividadReciente = db.prepare(`
            SELECT a.*, u.username 
            FROM auditoria a 
            LEFT JOIN usuarios u ON a.usuario_id = u.id 
            ORDER BY a.fecha DESC LIMIT 5
        `).all();

        res.json({
            stats: {
                caja: cajaTotal.total || 0,
                asistencia: asistenciaHoy.count || 0,
                pagos: pagosPendientes.count || 0,
                produccion: 1250 // Mock value for demo
            },
            actividad: actividadReciente
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener estadísticas' });
    }
};
