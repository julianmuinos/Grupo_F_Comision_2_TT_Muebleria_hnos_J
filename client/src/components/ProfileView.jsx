import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Obtiene la fecha de registro desde user.createdAt o decodificando el timestamp
 * embebido en los primeros 8 caracteres hexadecimales del ObjectId de MongoDB.
 */
const getRegistrationDateLabel = (user) => {
  if (!user) return 'Miembro activo';

  let dateObj = null;
  if (user.createdAt) {
    const parsed = new Date(user.createdAt);
    if (!isNaN(parsed.getTime())) dateObj = parsed;
  }

  const rawId = user.id || user._id;
  if (!dateObj && typeof rawId === 'string' && /^[a-fA-F0-9]{24}$/.test(rawId)) {
    const timestampSeconds = parseInt(rawId.substring(0, 8), 16);
    const parsed = new Date(timestampSeconds * 1000);
    if (!isNaN(parsed.getTime())) dateObj = parsed;
  }

  if (!dateObj) return 'Cuenta verificada · 2026';

  return dateObj.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Genera las iniciales del usuario para el avatar de perfil
 */
const getUserInitials = (nombre) => {
  if (!nombre || typeof nombre !== 'string') return 'HJ';
  const parts = nombre.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Componente ProfileView (/perfil)
 * Vista protegida mediante <ProtectedRoute> que exhibe los datos del cliente autenticado:
 * - Nombre, email, fecha de registro y estado de la cuenta
 * - Enlace directo a /mis-pedidos y botón de cierre de sesión (logout)
 */
const ProfileView = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const initials = getUserInitials(user?.nombre);
  const registrationDate = getRegistrationDateLabel(user);
  const clientId = user?.id || user?._id || '—';

  return (
    <section className="profile-page-section" aria-labelledby="profile-heading">
      <div className="profile-card-wrapper">
        {/* Cabecera de Perfil */}
        <div className="profile-header-banner">
          <div className="profile-avatar" aria-hidden="true">
            {initials}
          </div>
          <div className="profile-header-text">
            <div className="profile-badges-row">
              <span className="section-badge">Mi Cuenta · Hermanos Jota</span>
              <span className="profile-status-pill">
                <span className="status-dot" aria-hidden="true" />
                Cuenta Activa
              </span>
            </div>
            <h1 id="profile-heading" className="profile-user-name">
              {user?.nombre || 'Cliente Hermanos Jota'}
            </h1>
            <p className="profile-user-email">{user?.email}</p>
          </div>
        </div>

        {/* Grilla de Información del Cliente */}
        <div className="profile-details-section">
          <h2 className="profile-section-subtitle">Información Personal y de Cuenta</h2>
          <div className="profile-info-grid">
            <div className="profile-info-item">
              <span className="profile-info-label">Nombre Completo</span>
              <span className="profile-info-value">{user?.nombre || '—'}</span>
            </div>

            <div className="profile-info-item">
              <span className="profile-info-label">Correo Electrónico</span>
              <span className="profile-info-value">{user?.email || '—'}</span>
            </div>

            <div className="profile-info-item">
              <span className="profile-info-label">Fecha de Registro</span>
              <span className="profile-info-value">{registrationDate}</span>
            </div>

            <div className="profile-info-item">
              <span className="profile-info-label">Estado / ID de Cliente</span>
              <span className="profile-info-value">
                Verificado · <code className="profile-id-code">{clientId}</code>
              </span>
            </div>
          </div>
        </div>

        {/* Panel de Acceso Rápido a Mis Pedidos y Acciones */}
        <div className="profile-orders-callout">
          <div className="profile-callout-info">
            <h3>Historial de Compras y Cotizaciones</h3>
            <p>
              Consultá el estado de tus órdenes, el detalle de las piezas adquiridas y tus comprobantes.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/mis-pedidos')}
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
              <path d="M16 16h6" />
              <path d="M19 13v6" />
              <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14" />
              <path d="m7.5 4.27 9 5.15" />
              <polyline points="3.29 7 12 12 20.71 7" />
              <line x1="12" x2="12" y1="22" y2="12" />
            </svg>
            Ver Mis Pedidos
          </button>
        </div>

        {/* Botonera Inferior: Catálogo y Cerrar Sesión */}
        <div className="profile-footer-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/productos')}
          >
            Explorar Catálogo
          </button>

          <button
            type="button"
            className="btn profile-logout-btn"
            onClick={handleLogout}
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
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProfileView;
