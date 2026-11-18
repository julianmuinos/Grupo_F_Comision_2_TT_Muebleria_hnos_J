import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MobileSidebar from './MobileSidebar';

/**
 * Componente Navbar
 * Basado en la identidad oficial de Hermanos Jota (Sprint 1 & 2)
 * Props:
 * - cartCount: cantidad total de artículos en el carrito
 * - currentView: vista actual opcional
 * - onNavigate: función opcional para cambiar de vista
 * - onOpenCart: función para abrir el modal del carrito
 */
const Navbar = ({ cartCount, currentView: propCurrentView, onNavigate, onOpenCart }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  // Determinar vista activa según la ruta actual ('Catálogo' activo también en /productos/:id)
  const isHome = location.pathname === '/';
  const isCatalog =
    location.pathname === '/catalogo' || location.pathname.startsWith('/producto');
  const isContact = location.pathname === '/contacto';
  const isAdmin = location.pathname.startsWith('/admin');

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

        {/* Enlaces de Navegación (Desktop) */}
        <nav className="nav-links">
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
          <button
            type="button"
            className={`nav-button ${isAdmin ? 'active' : ''}`}
            onClick={() => handleNavigate('/admin/crear-producto')}
          >
            + Crear Producto
          </button>
        </nav>

        {/* Botón de Carrito con Contador vía Props */}
        <div className="nav-actions">
          <button
            type="button"
            className="cart-button"
            onClick={onOpenCart}
            aria-label="Ver carrito de cotización"
            title="Ver carrito de cotización"
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
              {cartCount}
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
        onOpenCart={onOpenCart}
        cartCount={cartCount}
      />
    </header>
  );
};

export default Navbar;
