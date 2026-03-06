import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppThemeProvider } from './context/ThemeContext.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import MainLayout from './layout/MainLayout.tsx';
import Login from './pages/Login.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Caja from './pages/Caja.tsx';

// Componente para proteger rutas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token, loading } = useAuth();
    
    if (loading) return null;
    if (!token) return <Navigate to="/login" />;
    
    return <>{children}</>;
};

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
                <ProtectedRoute>
                    <MainLayout />
                </ProtectedRoute>
            }>
                <Route index element={<Navigate to="/dashboard" />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="caja" element={<Caja />} />
                {/* Otros módulos se cargarían aquí */}
                <Route path="*" element={
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                        <h2>Módulo en Desarrollo</h2>
                        <p>Esta funcionalidad estará disponible próximamente para Avícola Renzo's.</p>
                    </div>
                } />
            </Route>
            
            <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
    );
};

export default function App() {
    return (
        <AppThemeProvider>
            <AuthProvider>
                <Router>
                    <AppRoutes />
                </Router>
            </AuthProvider>
        </AppThemeProvider>
    );
}
