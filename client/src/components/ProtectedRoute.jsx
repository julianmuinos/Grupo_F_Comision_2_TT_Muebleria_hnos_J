import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente ProtectedRoute
 * Protege rutas privadas (como /perfil y /mis-pedidos) verificando la sesión en AuthContext.
 * Si el usuario no está autenticado, redirige a /login guardando la ubicación de origen.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="state-container loading-container" role="status">
        <div className="spinner" />
        <h2>Verificando sesión...</h2>
        <p>Comprobando tus credenciales de acceso.</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
