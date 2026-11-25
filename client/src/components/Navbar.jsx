import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MobileSidebar from './MobileSidebar';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

/**
 * Componente Navbar
 * Basado en la identidad oficial de Hermanos Jota con Navegación Dinámica (UI Condicional):
 * - Consume AuthContext (isAuthenticated, user, logout) y CartContext (cartCount, openCart)
 * - Sin sesión: muestra accesos a Login (/login) y Registro (/registro), ocultando + Crear Producto
 * - Con sesión: oculta Login/Registro, muestra + Crear Producto, saludo al usuario,
 *   enlaces a /perfil y /mis-pedidos, y botón Cerrar Sesión (logout)
 */
const Navbar = ({
  currentView: propCurrentView,
  onNavigate,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems, openCart } = useCart();

  const handleNavigate = (path) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  const handleLogout = () => {
    logout();
    handleNavigate('/');
  };

  const firstName = user?.nombre ? user.nombre.trim().split(/\s+/)[0] : 'Cliente';

  // Determinar vista activa según la ruta actual
  const isHome = location.pathname === '/';
  const isCatalog =
    location.pathname === '/catalogo' || location.pathname.startsWith('/producto');
  const isContact = location.pathname === '/contacto';
  const isAdmin = location.pathname.startsWith('/admin');
  const isProfile = location.pathname === '/perfil';
  const isOrders = location.pathname === '/mis-pedidos';
  const isLogin = location.pathname === '/login';
  const isRegister = location.pathname === '/registro';

  const activeView =
    propCurrentView ||
    (isHome
      ? 'inicio'
      : isCatalog
      ? 'catalogo'
      : isContact
      ? 'contacto'
      : isAdmin
      ? 'admin'
      : isProfile
      ? 'perfil'
      : isOrders
      ? 'mis-pedidos'
      : isLogin
      ? 'login'
      : isRegister
      ? 'registro'
      : '');

  return (
    <header className="navbar-container">
      <div className="navbar-content">
        {/* Botón Hamburguesa exclusivo para pantallas móviles */}
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Abrir menú de navegación"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </button>

        {/* Logotipo Oficial Hermanos Jota */}
        <button
          type="button"
          className="brand"
          onClick={() => handleNavigate('/')}
          title="Ir al inicio"
          aria-label="Ir al inicio - Mueblería Hermanos Jota"
        >
          <img
            src="/assets/images/logo.svg"
            alt="Logo Circular Hermanos Jota"
            className="brand-logo-img"
          />
          <div className="brand-text">
            <span className="brand-name">HERMANOS JOTA</span>
            <span className="brand-tagline">Buenos Aires · 2026</span>
          </div>
        </button>

        {/* Enlaces de Navegación Principal (Desktop) */}
        <nav className="nav-links" aria-label="Navegación principal">
          <button
            type="button"
            className={`nav-button ${isHome ? 'active' : ''}`}
            onClick={() => handleNavigate('/')}
          >
            Inicio
          </button>
          <button
            type="button"
            className={`nav-button ${isCatalog ? 'active' : ''}`}
            onClick={() => handleNavigate('/productos')}
          >
            Catálogo
          </button>
          <button
            type="button"
            className={`nav-button ${isContact ? 'active' : ''}`}
            onClick={() => handleNavigate('/contacto')}
          >
            Contacto
          </button>

          {/* Opciones visibles únicamente con sesión activa */}
          {isAuthenticated && (
            <>
              <button
                type="button"
                className={`nav-button ${isOrders ? 'active' : ''}`}
                onClick={() => handleNavigate('/mis-pedidos')}
              >
                Mis Pedidos
              </button>
              <button
                type="button"
                className={`nav-button ${isProfile ? 'active' : ''}`}
                onClick={() => handleNavigate('/perfil')}
              >
                Mi Perfil
              </button>
              <button
                type="button"
                className={`nav-button ${isAdmin ? 'active' : ''}`}
                onClick={() => handleNavigate('/admin/crear-producto')}
              >
                + Crear Producto
              </button>
            </>
          )}
        </nav>

        {/* Acciones Derecha: UI Condicional de Autenticación + Carrito */}
        <div className="nav-actions">
          {!isAuthenticated ? (
            <div className="nav-auth-group">
              <button
                type="button"
                className={`nav-button nav-login-btn ${isLogin ? 'active' : ''}`}
                onClick={() => handleNavigate('/login')}
              >
                Login
              </button>
              <button
                type="button"
                className={`nav-register-btn ${isRegister ? 'active' : ''}`}
                onClick={() => handleNavigate('/registro')}
              >
                Registro
              </button>
            </div>
          ) : (
            <div className="nav-auth-group nav-auth-logged">
              <button
                type="button"
                className={`nav-user-greeting ${isProfile ? 'active' : ''}`}
                onClick={() => handleNavigate('/perfil')}
                title="Ver mi perfil"
              >
                <span className="nav-user-dot" aria-hidden="true" />
                Hola, <strong>{firstName}</strong>
              </button>
              <button
                type="button"
                className="nav-logout-btn"
                onClick={handleLogout}
                title="Cerrar sesión"
              >
                Salir
              </button>
            </div>
          )}

          <button
            type="button"
            className="cart-button"
            onClick={openCart}
            aria-label="Ver carrito de compras"
            title="Ver carrito de compras"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span className="cart-badge" id="cart-counter">
              {totalItems}
            </span>
          </button>
        </div>
      </div>

      {/* Barra lateral de navegación móvil (Drawer) */}
      <MobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        currentView={activeView}
        onNavigate={handleNavigate}
      />
    </header>
  );
};

export default Navbar;
