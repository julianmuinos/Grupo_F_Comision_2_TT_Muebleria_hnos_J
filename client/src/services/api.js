import axios from 'axios';

export const TOKEN_STORAGE_KEY = 'hnosj_token';

/**
 * Instancia centralizada de Axios para comunicación con la API del Backend
 * - baseURL: apunta a VITE_API_URL (por defecto http://localhost:5000/api)
 * - timeout: 60000ms (60 segundos para tolerar arranques en frío de Render)
 * - headers: JSON por defecto
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de peticiones: inyecta automáticamente Authorization: Bearer <token>
 * desde localStorage si existe sesión activa (evita fallos al recargar rutas protegidas).
 */
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (token && !config.headers?.Authorization) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Ignorar errores de acceso a localStorage
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
