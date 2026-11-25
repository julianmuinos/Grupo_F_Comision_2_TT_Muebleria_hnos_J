import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

/**
 * Componente MobileSidebar
 * Barra lateral de navegación deslizable (Drawer) para dispositivos móviles.
 * Integra navegación dinámica (UI condicional) consumiendo AuthContext y CartContext:
 * - Sin sesión: muestra accesos a LOGIN (/login) y REGISTRO (/registro)
 * - Con sesión: muestra tarjeta de saludo al usuario, MI PERFIL (/perfil),
 *   MIS PEDIDOS (/mis-pedidos), CREAR PRODUCTO (/admin/crear-producto) y CERRAR SESIÓN
 */
const MobileSidebar = ({
  isOpen,
  onClose,
  currentView,
  onNavigate,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems, openCart } = useCart();

  // Cerrar al presionar la tecla Escape y bloquear scroll del fondo cuando está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose]);

  const handleLinkClick = (view) => {
    if (view === 'inicio') onNavigate?.('/');
    else if (view === 'catalogo') onNavigate?.('/productos');
    else if (view === 'contacto') onNavigate?.('/contacto');
    else if (view === 'admin') onNavigate?.('/admin/crear-producto');
    else if (view === 'perfil') onNavigate?.('/perfil');
    else if (view === 'mis-pedidos') onNavigate?.('/mis-pedidos');
    else if (view === 'login') onNavigate?.('/login');
    else if (view === 'registro') onNavigate?.('/registro');
    else onNavigate?.(view);
    onClose();
  };

  const handleCartClick = () => {
    openCart();
    onClose();
  };

  const handleLogoutClick = () => {
    logout();
    onNavigate?.('/');
    onClose();
  };

  const isHomeActive = currentView === 'inicio' || currentView === '/';
  const isCatalogActive =
    currentView === 'catalogo' ||
    currentView === '/catalogo' ||
    currentView === '/productos' ||
    currentView === 'detalle' ||
    (typeof currentView === 'string' && currentView.startsWith('/producto'));
  const isContactActive = currentView === 'contacto' || currentView === '/contacto';
  const isAdminActive =
    currentView === 'admin' ||
    (typeof currentView === 'string' && currentView.startsWith('/admin'));
  const isProfileActive = currentView === 'perfil' || currentView === '/perfil';
  const isOrdersActive =
    currentView === 'mis-pedidos' || currentView === '/mis-pedidos';
  const isLoginActive = currentView === 'login' || currentView === '/login';
  const isRegisterActive = currentView === 'registro' || currentView === '/registro';

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      {/* Fondo oscurecido con desenfoque (Backdrop) */}
      <div
        className={`mobile-sidebar-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Drawer Lateral Deslizable */}
      <aside
        className={`mobile-sidebar-drawer ${isOpen ? 'open' : ''}`}
        aria-label="Menú principal de navegación móvil"
        aria-hidden={!isOpen}
      >
        {/* Cabecera del Drawer */}
        <div className="mobile-drawer-header">
          <div
            className="mobile-drawer-brand"
            onClick={() => handleLinkClick('inicio')}
            role="button"
            tabIndex={0}
          >
            <img
              src="/assets/images/logo.svg"
              alt="Logo Hermanos Jota"
              className="mobile-drawer-logo"
            />
            <span className="mobile-drawer-brand-name">Hermanos Jota</span>
          </div>

          <button
            type="button"
            className="mobile-drawer-close"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Bloque de Saludo al Usuario Autenticado */}
        {isAuthenticated && user && (
          <div className="mobile-drawer-user-card">
            <span className="mobile-user-greeting">Hola, {user.nombre}</span>
            <span className="mobile-user-email">{user.email}</span>
          </div>
        )}

        {/* Lista de Navegación */}
        <nav className="mobile-drawer-nav">
          <button
            type="button"
            className={`mobile-nav-item ${isHomeActive ? 'active' : ''}`}
            onClick={() => handleLinkClick('inicio')}
          >
            <svg
              className="mobile-nav-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="mobile-nav-text">INICIO</span>
          </button>

          <button
            type="button"
            className={`mobile-nav-item ${isCatalogActive ? 'active' : ''}`}
            onClick={() => handleLinkClick('catalogo')}
          >
            <svg
              className="mobile-nav-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
              <path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H7v-2a2 2 0 0 0-4 0Z" />
              <path d="M5 18v2" />
              <path d="M19 18v2" />
            </svg>
            <span className="mobile-nav-text">CATÁLOGO</span>
          </button>

          <button
            type="button"
            className={`mobile-nav-item ${isContactActive ? 'active' : ''}`}
            onClick={() => handleLinkClick('contacto')}
          >
            <svg
              className="mobile-nav-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <span className="mobile-nav-text">CONTACTO</span>
          </button>

          <button
            type="button"
            className="mobile-nav-item mobile-nav-item-cart"
            onClick={handleCartClick}
          >
            <svg
              className="mobile-nav-icon"
              width="20"
              height="20"
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
            <span className="mobile-nav-text">CARRITO</span>
            <span className="mobile-nav-badge">{totalItems}</span>
          </button>

          <div className="mobile-nav-divider" />

          {/* UI Condicional en Mobile */}
          {!isAuthenticated ? (
            <>
              <button
                type="button"
                className={`mobile-nav-item ${isLoginActive ? 'active' : ''}`}
                onClick={() => handleLinkClick('login')}
              >
                <svg
                  className="mobile-nav-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" x2="3" y1="12" y2="12" />
                </svg>
                <span className="mobile-nav-text">LOGIN</span>
              </button>

              <button
                type="button"
                className={`mobile-nav-item ${isRegisterActive ? 'active' : ''}`}
                onClick={() => handleLinkClick('registro')}
              >
                <svg
                  className="mobile-nav-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" x2="19" y1="8" y2="14" />
                  <line x1="22" x2="16" y1="11" y2="11" />
                </svg>
                <span className="mobile-nav-text">REGISTRO</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={`mobile-nav-item ${isProfileActive ? 'active' : ''}`}
                onClick={() => handleLinkClick('perfil')}
              >
                <svg
                  className="mobile-nav-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span className="mobile-nav-text">MI PERFIL</span>
              </button>

              <button
                type="button"
                className={`mobile-nav-item ${isOrdersActive ? 'active' : ''}`}
                onClick={() => handleLinkClick('mis-pedidos')}
              >
                <svg
                  className="mobile-nav-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                  <path d="m3.3 7 8.7 5 8.7-5" />
                  <path d="M12 22V12" />
                </svg>
                <span className="mobile-nav-text">MIS PEDIDOS</span>
              </button>

              <button
                type="button"
                className={`mobile-nav-item ${isAdminActive ? 'active' : ''}`}
                onClick={() => handleLinkClick('admin')}
              >
                <svg
                  className="mobile-nav-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                <span className="mobile-nav-text">CREAR PRODUCTO</span>
              </button>

              <button
                type="button"
                className="mobile-nav-item mobile-nav-item-logout"
                onClick={handleLogoutClick}
              >
                <svg
                  className="mobile-nav-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" x2="9" y1="12" y2="12" />
                </svg>
                <span className="mobile-nav-text">CERRAR SESIÓN</span>
              </button>
            </>
          )}
        </nav>

        {/* Pie del Drawer con Información de Showroom */}
        <div className="mobile-drawer-footer">
          <div className="mobile-drawer-showroom-label">SHOWROOM</div>
          <div className="mobile-drawer-info-row">
            <svg
              className="mobile-drawer-info-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>Av. San Juan 2847, CABA</span>
          </div>

          <div className="mobile-drawer-info-row">
            <svg
              className="mobile-drawer-info-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>Lun - Vie 10:00 a 19:00</span>
          </div>
        </div>
      </aside>
    </>,
    document.body
  );
};

export default MobileSidebar;
