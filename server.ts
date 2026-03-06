import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { initDb } from './server/config/db.ts';
import { login, getProfile } from './server/controllers/authController.ts';
import { authenticateToken } from './server/middlewares/auth.ts';
import { getUserModules, getDashboardStats } from './server/controllers/moduleController.ts';

async function startServer() {
    const app = express();
    const PORT = 3000;

    // Initialize Database
    initDb();

    app.use(express.json());

    // API Routes
    app.post('/api/auth/login', login);
    app.get('/api/auth/profile', authenticateToken, getProfile);
    app.get('/api/modules', authenticateToken, getUserModules);
    app.get('/api/dashboard/stats', authenticateToken, getDashboardStats);

    // Generic CRUD routes (Example for Caja)
    app.get('/api/caja', authenticateToken, (req, res) => {
        const data = require('./server/config/db.ts').default.prepare('SELECT * FROM caja ORDER BY fecha DESC').all();
        res.json(data);
    });

    app.post('/api/caja', authenticateToken, (req: any, res) => {
        const { tipo, monto, descripcion } = req.body;
        const db = require('./server/config/db.ts').default;
        db.prepare('INSERT INTO caja (tipo, monto, descripcion, usuario_id) VALUES (?, ?, ?, ?)').run(tipo, monto, descripcion, req.user.id);
        db.prepare('INSERT INTO auditoria (usuario_id, accion, modulo, detalles) VALUES (?, ?, ?, ?)')
          .run(req.user.id, 'INSERT', 'caja', `Registro de ${tipo} por ${monto}`);
        res.status(201).json({ message: 'Registro creado' });
    });

    // Vite middleware for development
    if (process.env.NODE_ENV !== 'production') {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
        });
        app.use(vite.middlewares);
    } else {
        app.use(express.static(path.resolve('dist')));
        app.get('*', (req, res) => {
            res.sendFile(path.resolve('dist/index.html'));
        });
    }

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`ERP Avícola Renzo's running on http://localhost:${PORT}`);
    });
}

startServer();
