import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getMyOrders } from '../api/orders';
import { useAuth } from '../context/AuthContext';

const STATUS_META = {
  pendiente: { label: 'Pendiente', className: 'status-pendiente' },
  pagado: { label: 'Pagado', className: 'status-pagado' },
  'en preparacion': { label: 'En preparación', className: 'status-preparacion' },
  enviado: { label: 'Enviado', className: 'status-enviado' },
  entregado: { label: 'Entregado', className: 'status-entregado' },
  cancelado: { label: 'Cancelado', className: 'status-cancelado' },
};

const PAYMENT_LABELS = {
  transferencia: 'Transferencia bancaria',
  tarjeta: 'Tarjeta',
  efectivo: 'Efectivo',
  mercado_pago: 'Mercado Pago',
};

const formatoMoneda = (valor) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(Number(valor) || 0);

const formatoFecha = (isoDate) => {
  if (!isoDate) return 'Fecha no disponible';
  const parsed = new Date(isoDate);
  if (isNaN(parsed.getTime())) return 'Fecha no disponible';

  return parsed.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getShortOrderNumber = (id) => {
  if (!id) return 'PEDIDO';
  return `#${String(id).slice(-6).toUpperCase()}`;
};

/**
 * Componente MyOrdersView (/mis-pedidos)
 * Página protegida mediante <ProtectedRoute> que consulta GET /api/orders/my-orders
 * con el JWT del cliente y muestra el historial de pedidos contemplando:
 * - Estado de carga
 * - Estado de error con reintento
 * - Lista vacía ("Aún no tenés pedidos")
 * - Listado detallado de pedidos (ID/número, fecha, muebles, cantidades, total y estado)
 */
const MyOrdersView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, logout } = useAuth();

  const [confirmedOrder] = useState(() => location.state?.orderCreated || null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Limpiar el state de navegación tras capturar la orden recién creada
  useEffect(() => {
    if (location.state?.orderCreated) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    getMyOrders(controller.signal, token)
      .then((data) => {
        if (!active) return;
        setOrders(data);
        setError(null);
      })
      .catch((err) => {
        if (!active || err.name === 'AbortError') return;
        if (err.status === 401) {
          logout();
          navigate('/login', {
            replace: true,
            state: {
              from: { pathname: '/mis-pedidos' },
              authNotice:
                'Tu sesión expiró. Iniciá sesión nuevamente para consultar tus pedidos.',
            },
          });
          return;
        }
        setError(err.message || 'No pudimos cargar tu historial de pedidos.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [token, reloadKey, logout, navigate]);

  const handleRetry = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadKey((prev) => prev + 1);
  }, []);

  if (loading) {
    return (
      <div className="state-container loading-container" role="status" aria-live="polite">
        <div className="spinner" />
        <h2>Cargando tus pedidos...</h2>
        <p>Consultando tu historial de compras en Hermanos Jota.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-container error-container" role="alert">
        <div className="error-icon" aria-hidden="true">
          ⚠️
        </div>
        <h2>No pudimos cargar tus pedidos</h2>
        <p className="error-detail">{error}</p>
        <div className="orders-empty-actions">
          <button type="button" className="btn btn-primary" onClick={handleRetry}>
            Reintentar
          </button>
          <button
            type="button"
            className="btn btn-secondary-light"
            onClick={() => navigate('/perfil')}
          >
            Volver a Mi Perfil
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <section className="orders-page-section" aria-labelledby="orders-empty-heading">
        <div className="state-container">
          <span className="section-badge">Mi Cuenta · Hermanos Jota</span>
          <h1 id="orders-empty-heading" className="orders-empty-title">
            Aún no tenés pedidos
          </h1>
          <p className="section-subtitle">
            Explorá nuestro catálogo de muebles de autor y confirmá tu primera compra desde el carrito.
          </p>
          <div className="orders-empty-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/productos')}
            >
              Explorar Catálogo
            </button>
            <button
              type="button"
              className="btn btn-secondary-light"
              onClick={() => navigate('/perfil')}
            >
              Volver a Mi Perfil
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="orders-page-section" aria-labelledby="orders-heading">
      <div className="orders-header-card">
        <div className="orders-header-text">
          <span className="section-badge">Mi Cuenta · Hermanos Jota</span>
          <h1 id="orders-heading" className="orders-main-title">
            Mis Pedidos
          </h1>
          <p className="orders-main-subtitle">
            Tenés <strong>{orders.length}</strong>{' '}
            {orders.length === 1 ? 'pedido registrado' : 'pedidos registrados'} en tu cuenta.
          </p>
        </div>

        <div className="orders-header-actions">
          <button
            type="button"
            className="btn btn-secondary-light"
            onClick={() => navigate('/perfil')}
          >
            Mi Perfil
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/productos')}
          >
            Seguir Comprando
          </button>
        </div>
      </div>

      {confirmedOrder && (
        <div className="orders-success-banner" role="status">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <div>
            <strong>¡Pedido {getShortOrderNumber(confirmedOrder._id)} confirmado con éxito!</strong>
            <p>
              Ya registramos tu compra por un total de {formatoMoneda(confirmedOrder.total)}.
            </p>
          </div>
        </div>
      )}

      <div className="orders-list">
        {orders.map((order) => {
          const orderId = order._id || order.id;
          const statusKey = String(order.estado || 'pendiente').toLowerCase();
          const statusInfo = STATUS_META[statusKey] || {
            label: order.estado || 'Pendiente',
            className: 'status-pendiente',
          };
          const paymentLabel =
            PAYMENT_LABELS[order.metodoPago] || order.metodoPago || 'Transferencia';
          const orderItems = Array.isArray(order.items) ? order.items : [];

          return (
            <article key={orderId} className="order-card">
              <header className="order-card-header">
                <div className="order-meta-group">
                  <div className="order-number-row">
                    <span className="order-number-badge">
                      Pedido {getShortOrderNumber(orderId)}
                    </span>
                    <code className="order-id-code" title="Identificador de orden">
                      ID: {orderId}
                    </code>
                  </div>
                  <p className="order-date-text">
                    Realizado el {formatoFecha(order.createdAt)} · {paymentLabel}
                  </p>
                </div>

                <span className={`order-status-badge ${statusInfo.className}`}>
                  {statusInfo.label}
                </span>
              </header>

              <div className="order-items-list">
                {orderItems.map((item, idx) => {
                  const prodObj =
                    item.producto && typeof item.producto === 'object'
                      ? item.producto
                      : null;
                  const prodId = prodObj?._id || item.producto || idx;
                  const itemNombre =
                    item.nombre || prodObj?.nombre || 'Mueble Hermanos Jota';
                  const itemImagen =
                    item.imagen ||
                    prodObj?.imagen ||
                    prodObj?.imagenUrl ||
                    '/assets/images/logo.svg';
                  const itemPrecio = Number(item.precio ?? prodObj?.precio ?? 0);
                  const itemCantidad = Number(item.cantidad) || 1;
                  const itemSubtotal = Number(item.subtotal ?? itemPrecio * itemCantidad);

                  return (
                    <div key={`${orderId}-${prodId}-${idx}`} className="order-item-row">
                      <img
                        src={itemImagen}
                        alt={itemNombre}
                        className="order-item-thumb"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = '/assets/images/logo.svg';
                        }}
                      />
                      <div className="order-item-info">
                        <h3 className="order-item-name">{itemNombre}</h3>
                        <p className="order-item-meta">
                          Cantidad: <strong>{itemCantidad}</strong> ·{' '}
                          {formatoMoneda(itemPrecio)} c/u
                        </p>
                      </div>
                      <div className="order-item-subtotal">
                        {formatoMoneda(itemSubtotal)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <footer className="order-card-footer">
                <span className="order-items-count">
                  {orderItems.reduce((acc, it) => acc + (Number(it.cantidad) || 0), 0)}{' '}
                  {orderItems.reduce((acc, it) => acc + (Number(it.cantidad) || 0), 0) === 1
                    ? 'mueble'
                    : 'muebles'}
                </span>
                <div className="order-total-box">
                  <span className="order-total-label">Total del pedido</span>
                  <strong className="order-total-value">
                    {formatoMoneda(order.total)}
                  </strong>
                </div>
              </footer>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default MyOrdersView;
