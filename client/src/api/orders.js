import { apiClient } from '../services/api';
import { getProductoId } from './productos';

// Desempaqueta la respuesta del backend ({ success, data })
const unwrapData = (payload) =>
  payload && payload.data !== undefined ? payload.data : payload;

// Normaliza errores de Axios manteniendo compatibilidad con AbortError y códigos HTTP
const normalizeOrderError = (err, fallbackMessage) => {
  if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') {
    const abortError = new Error('Petición cancelada');
    abortError.name = 'AbortError';
    return abortError;
  }

  const status = err?.response?.status;
  const data = err?.response?.data;
  const backendErrors = data?.errores;
  const detailedMessage =
    Array.isArray(backendErrors) && backendErrors.length > 0
      ? backendErrors.join(' ')
      : data?.message;

  const isTimeout = err?.code === 'ECONNABORTED';
  const message =
    detailedMessage ||
    (isTimeout
      ? 'El servidor tardó demasiado en responder (posible arranque en frío). Intentá nuevamente.'
      : status
      ? `Error en el servidor (HTTP ${status})`
      : err?.message || fallbackMessage);

  const error = new Error(message);
  if (status) error.status = status;
  if (Array.isArray(backendErrors)) error.errores = backendErrors;
  return error;
};

/**
 * POST /api/orders — Crea un pedido autenticado a partir de los ítems del carrito.
 * El servidor valida stock, toma precios reales de MongoDB y asocia el pedido a req.user.
 */
export const createOrder = async (items, options = {}, token = null) => {
  if (!Array.isArray(items) || items.length === 0) {
    const emptyError = new Error('Tu carrito está vacío. Agregá al menos un mueble antes de confirmar.');
    emptyError.status = 400;
    throw emptyError;
  }

  const payload = {
    items: items.map((item) => ({
      producto: getProductoId(item),
      cantidad: Number(item.cantidad) || 1,
    })),
    ...(options.metodoPago ? { metodoPago: options.metodoPago } : {}),
    ...(options.direccionEnvio ? { direccionEnvio: options.direccionEnvio } : {}),
  };

  const config = token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : undefined;

  try {
    const response = await apiClient.post('/orders', payload, config);
    return unwrapData(response.data);
  } catch (err) {
    throw normalizeOrderError(
      err,
      'No se pudo procesar tu pedido. Verificá tu conexión e intentá nuevamente.'
    );
  }
};

/**
 * GET /api/orders/my-orders — Obtiene el historial de pedidos del cliente autenticado.
 */
export const getMyOrders = async (signal, token = null) => {
  const config = {
    ...(signal ? { signal } : {}),
    ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
  };

  try {
    const response = await apiClient.get('/orders/my-orders', config);
    const data = unwrapData(response.data);
    if (!Array.isArray(data)) {
      throw new Error('El formato de pedidos devuelto por la API no es válido.');
    }
    return data;
  } catch (err) {
    throw normalizeOrderError(
      err,
      'No se pudo cargar tu historial de pedidos. Intentá nuevamente.'
    );
  }
};
