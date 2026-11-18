import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductoId } from '../api/productos';

/**
 * Componente CartModal
 * Modal deslizable o ventana emergente que muestra los artículos en el carrito.
 * Props:
 * - isOpen: booleano que indica si el modal está visible
 * - onClose: función para cerrar el modal
 * - cart: array de productos con sus cantidades [{ ...producto, cantidad }]
 * - onUpdateQuantity: (id, delta) => void
 * - onRemoveItem: (id) => void
 * - onClearCart: () => void
 */
const CartModal = ({ isOpen, onClose, cart, onUpdateQuantity, onRemoveItem, onClearCart }) => {
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  // Cálculo del subtotal y total con umbral realista de envío bonificado
  const UMBRAL_ENVIO_GRATIS = 1500000; // $1.500.000 ARS
  const subtotal = cart.reduce(
    (acc, item) => acc + (item.precio ?? item.price ?? 0) * item.cantidad,
    0
  );
  const envioGratis = subtotal >= UMBRAL_ENVIO_GRATIS;
  const costoEnvio = subtotal > 0 && !envioGratis ? 8500 : 0;
  const total = subtotal + costoEnvio;

  const formatoMoneda = (valor) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(valor);
  };

  const handleCheckout = () => {
    setCheckoutComplete(true);
    setTimeout(() => {
      onClearCart();
      setCheckoutComplete(false);
      onClose();
    }, 3000);
  };

  const handleExploreCatalog = () => {
    onClose();
    navigate('/productos');
  };

  return (
    <div className="cart-backdrop" onClick={onClose}>
      <aside className="cart-drawer" onClick={(e) => e.stopPropagation()}>
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
            <h2>Tu Carrito de Compras</h2>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Cerrar carrito">
            ✕
          </button>
        </div>

        {checkoutComplete ? (
          <div className="checkout-success-view">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--verde-salvia)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <h3>¡Pedido confirmado con éxito!</h3>
            <p>
              Gracias por confiar en <strong>Mueblería Hermanos Jota</strong>. Te hemos enviado un correo con el detalle de entrega y factura.
            </p>
            <p className="redirect-note">Cerrando el carrito...</p>
          </div>
        ) : cart.length === 0 ? (
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
              {cart.map((item) => {
                const itemId = getProductoId(item);
                const itemNombre = item.nombre || item.title || item.name;
                const itemImagen =
                  item.imagenUrl || item.imagen || item.image || item.foto;
                const itemPrecio = item.precio ?? item.price ?? 0;

                return (
                  <div key={itemId} className="cart-item">
                    <img src={itemImagen} alt={itemNombre} className="cart-item-image" />
                    <div className="cart-item-details">
                      <h4 className="cart-item-title">{itemNombre}</h4>
                      <p className="cart-item-price">{formatoMoneda(itemPrecio)} c/u</p>
                      <div className="cart-item-controls">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(itemId, -1)}
                          className="qty-btn-mini"
                          title="Restar uno"
                        >
                          -
                        </button>
                        <span className="cart-item-qty">{item.cantidad}</span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(itemId, 1)}
                          className="qty-btn-mini"
                          disabled={item.cantidad >= item.stock}
                          title="Sumar uno"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(itemId)}
                          className="remove-btn"
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
                <span>Subtotal:</span>
                <span>{formatoMoneda(subtotal)}</span>
              </div>
              <div className="cart-summary-line">
                <span>Envío:</span>
                <span>{envioGratis ? '¡Gratis!' : formatoMoneda(costoEnvio)}</span>
              </div>
              {!envioGratis && (
                <p className="free-shipping-hint">
                  Agrega {formatoMoneda(UMBRAL_ENVIO_GRATIS - subtotal)} más para obtener{' '}
                  <strong>Envío Gratis</strong>
                </p>
              )}
              <div className="cart-summary-line total-line">
                <strong>Total a Pagar:</strong>
                <strong className="total-amount">{formatoMoneda(total)}</strong>
              </div>

              <div className="cart-actions-group">
                <button
                  type="button"
                  className="btn btn-primary btn-checkout"
                  onClick={handleCheckout}
                >
                  Confirmar Compra
                </button>
                <button
                  type="button"
                  className="btn btn-text btn-clear"
                  onClick={onClearCart}
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
