import { apiClient } from '../services/api';

/**
 * Servicio de Productos (Catálogo, Detalle y Mutaciones CRUD)
 * Centraliza las peticiones HTTP (GET, POST, PUT, DELETE) a la API REST de productos
 * utilizando la instancia centralizada de Axios (apiClient).
 */
const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const API_BASE = RAW_API_URL.replace(/\/api\/?$/, '');
export const PRODUCTOS_URL = `${API_BASE}/api/productos`;

// Desempaqueta la respuesta: soporta { data: ... } o el recurso directo
const unwrapData = (payload) =>
  payload && payload.data !== undefined ? payload.data : payload;

// Normaliza errores de Axios manteniendo compatibilidad con AbortError, códigos HTTP y array de errores de validación
const normalizeError = (err) => {
  if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') {
    const abortError = new Error('Petición cancelada');
    abortError.name = 'AbortError';
    return abortError;
  }
  const status = err?.response?.status;
  const backendErrors = err?.response?.data?.errores;
  const detailedMessage =
    Array.isArray(backendErrors) && backendErrors.length > 0
      ? backendErrors.join(' ')
      : err?.response?.data?.message;

  const message =
    detailedMessage ||
    (status ? `Error en el servidor (HTTP ${status})` : err?.message || 'Error de conexión');
  const error = new Error(message);
  if (status) error.status = status;
  if (Array.isArray(backendErrors)) error.errores = backendErrors;
  return error;
};

/** GET /api/productos — devuelve el listado completo */
export const getProductos = async (signal) => {
  try {
    const response = await apiClient.get('/productos', { signal });
    const data = unwrapData(response.data);
    if (!Array.isArray(data)) {
      throw new Error('El formato de datos devuelto por la API no es válido.');
    }
    return data;
  } catch (err) {
    throw normalizeError(err);
  }
};

/** GET /api/productos/:id — devuelve un producto por su _id */
export const getProductoById = async (id, signal) => {
  try {
    const response = await apiClient.get(`/productos/${encodeURIComponent(id)}`, { signal });
    return unwrapData(response.data);
  } catch (err) {
    throw normalizeError(err);
  }
};

/** POST /api/productos — crea un nuevo producto en la base de datos */
export const createProducto = async (productData) => {
  try {
    const response = await apiClient.post('/productos', productData);
    return unwrapData(response.data);
  } catch (err) {
    throw normalizeError(err);
  }
};

/** PUT /api/productos/:id — actualiza un producto existente por su _id */
export const updateProducto = async (id, productData) => {
  try {
    const response = await apiClient.put(
      `/productos/${encodeURIComponent(id)}`,
      productData
    );
    return unwrapData(response.data);
  } catch (err) {
    throw normalizeError(err);
  }
};

/** DELETE /api/productos/:id — elimina un producto existente por su _id */
export const deleteProducto = async (id) => {
  try {
    const response = await apiClient.delete(`/productos/${encodeURIComponent(id)}`);
    return unwrapData(response.data);
  } catch (err) {
    throw normalizeError(err);
  }
};

/** Identificador del producto: _id de MongoDB o id legado */
export const getProductoId = (product) => product?._id ?? product?.id;
