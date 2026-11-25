import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getProductoId } from '../api/productos';
import { createOrder } from '../api/orders';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const UMBRAL_ENVIO_GRATIS = 1500000; // $1.500.000 ARS

const formatoMoneda = (valor) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(Number(valor) || 0);

/**
 * Componente CartModal
 * Drawer lateral del carrito conectado directamente a CartContext y AuthContext.
 * Flujo "Finalizar Compra":
 * - Sin sesión: bloquea el envío, muestra aviso y redirige a /login conservando el carrito.
 * - Con sesión: envía POST /api/orders con Bearer JWT, limpia el carrito y redirige a /mis-pedidos.
 */
const CartModal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    items,
    totalItems,
    totalPrice,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();
  const { isAuthenticated, token, logout } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [authNotice, setAuthNotice] = useState(null);
  const redirectTimerRef = useRef(null);

  const resetTransientState = () => {
    setCheckoutError(null);
    setAuthNotice(null);
    setIsSubmitting(false);
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }
  };

  const handleCloseCart = () => {
    if (isSubmitting) return;
    resetTransientState();
    closeCart();
  };

  // Limpiar timers pendientes si el modal se cierra o se desmonta
  useEffect(() => {
    if (!isCartOpen && redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }
  }, [isCartOpen]);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  if (!isCartOpen) return null;

  const envioGratis = totalPrice >= UMBRAL_ENVIO_GRATIS;

  const handleCheckout = async () => {
    if (isSubmitting || authNotice) return;
    setCheckoutError(null);

    // 1. Si el usuario no está logueado: impedir POST, mostrar aviso y redirigir a /login
    if (!isAuthenticated) {
      const noticeMsg =
        'Necesitás iniciar sesión para finalizar tu compra. Guardamos tu carrito para que no pierdas ningún mueble.';
      setAuthNotice(noticeMsg);

      redirectTimerRef.current = setTimeout(() => {
        resetTransientState();
        closeCart();
        navigate('/login', {
          state: {
            from: location,
            authNotice: noticeMsg,
          },
        });
      }, 1100);
      return;
    }

    // 2. Usuario autenticado: enviar POST /api/orders con token Bearer
    setIsSubmitting(true);
    try {
      const createdOrder = await createOrder(items, {}, token);
      clearCart();
      resetTransientState();
      closeCart();
      navigate('/mis-pedidos', {
        state: { orderCreated: createdOrder },
      });
    } catch (err) {
      if (err.status === 401) {
        logout();
        resetTransientState();
        closeCart();
        navigate('/login', {
          state: {
            from: location,
            authNotice:
              'Tu sesión expiró. Iniciá sesión nuevamente para finalizar tu compra (tu carrito sigue guardado).',
          },
        });
        return;
      }

      setCheckoutError(
        err.message ||
          'No se pudo confirmar tu pedido. Verificá tu conexión e intentá nuevamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExploreCatalog = () => {
    resetTransientState();
    closeCart();
    navigate('/productos');
  };

  return (
    <div
      className="cart-backdrop"
      onClick={handleCloseCart}
      role="presentation"
    >
      <aside
        className="cart-drawer"
        onClick={(e) => e.stopPropagation()}
        aria-label="Carrito de compras"
      >
        <div className="cart-header">
          <div className="cart-title-row">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <h2>Tu Carrito ({totalItems})</h2>
          </div>
          <button
            type="button"
            className="close-btn"
            onClick={handleCloseCart}
            disabled={isSubmitting}
            aria-label="Cerrar carrito"
          >
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty-view">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" x2="22" y1="10" y2="10" />
            </svg>
            <h3>Tu carrito está vacío</h3>
            <p>Aún no agregaste muebles a tu pedido.</p>
            <button type="button" className="btn btn-primary" onClick={handleExploreCatalog}>
              Explorar el catálogo
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items-list custom-scroll">
              {items.map((item) => {
                const itemId = getProductoId(item);
                const itemNombre = item.nombre || item.title || item.name;
                const itemImagen =
                  item.imagenUrl || item.imagen || item.image || item.foto;
                const itemPrecio = Number(item.precio ?? item.price ?? 0);
                const maxStock = Number(item.stock) > 0 ? Number(item.stock) : 99;

                return (
                  <div key={itemId} className="cart-item">
                    <img src={itemImagen} alt={itemNombre} className="cart-item-image" />
                    <div className="cart-item-details">
                      <h4 className="cart-item-title">{itemNombre}</h4>
                      <p className="cart-item-price">{formatoMoneda(itemPrecio)} c/u</p>
                      <div className="cart-item-controls">
                        <button
                          type="button"
                          onClick={() => updateQuantity(itemId, item.cantidad - 1)}
                          className="qty-btn-mini"
                          disabled={isSubmitting}
                          title="Restar uno"
                          aria-label={`Disminuir cantidad de ${itemNombre}`}
                        >
                          -
                        </button>
                        <span className="cart-item-qty">{item.cantidad}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(itemId, item.cantidad + 1)}
                          className="qty-btn-mini"
                          disabled={isSubmitting || item.cantidad >= maxStock}
                          title="Sumar uno"
                          aria-label={`Aumentar cantidad de ${itemNombre}`}
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(itemId)}
                          className="remove-btn"
                          disabled={isSubmitting}
                          title="Eliminar producto"
                          aria-label={`Eliminar ${itemNombre}`}
                        >
                          <svg
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
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="cart-item-total">
                      {formatoMoneda(itemPrecio * item.cantidad)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cart-footer">
              <div className="cart-summary-line">
                <span>Subtotal ({totalItems} {totalItems === 1 ? 'unidad' : 'unidades'}):</span>
                <span>{formatoMoneda(totalPrice)}</span>
              </div>
              <div className="cart-summary-line">
                <span>Envío:</span>
                <span>{envioGratis ? '¡Bonificado!' : 'A coordinar'}</span>
              </div>
              {!envioGratis && (
                <p className="free-shipping-hint">
                  Agregá {formatoMoneda(UMBRAL_ENVIO_GRATIS - totalPrice)} más para obtener{' '}
                  <strong>Envío Bonificado</strong>
                </p>
              )}
              <div className="cart-summary-line total-line">
                <strong>Total a Pagar:</strong>
                <strong className="total-amount">{formatoMoneda(totalPrice)}</strong>
              </div>

              {!isAuthenticated && !authNotice && (
                <p className="cart-auth-hint" role="note">
                  Vas a necesitar iniciar sesión para confirmar tu pedido. Tu carrito se conserva guardado.
                </p>
              )}

              {authNotice && (
                <div className="cart-notice-alert" role="status">
                  {authNotice} Redirigiendo al login...
                </div>
              )}

              {checkoutError && (
                <div className="admin-alert-error cart-checkout-alert" role="alert">
                  {checkoutError}
                </div>
              )}

              <div className="cart-actions-group">
                <button
                  type="button"
                  className="btn btn-primary btn-checkout"
                  onClick={handleCheckout}
                  disabled={isSubmitting || Boolean(authNotice)}
                >
                  {isSubmitting ? (
                    <>
                      <span className="btn-inline-spinner" aria-hidden="true" />
                      Procesando pedido...
                    </>
                  ) : authNotice ? (
                    'Redirigiendo a Login...'
                  ) : (
                    'Finalizar Compra'
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-text btn-clear"
                  onClick={clearCart}
                  disabled={isSubmitting}
                >
                  Vaciar carrito
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
};

export default CartModal;
