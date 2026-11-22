import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { apiClient } from '../services/api';

const AuthContext = createContext(null);

const TOKEN_STORAGE_KEY = 'hnosj_token';
const USER_STORAGE_KEY = 'hnosj_user';

/**
 * Extrae el payload { token, user } soportando tanto la respuesta plana de main
 * ({ success, token, user }) como la respuesta anidada ({ success, data: { token, user } }).
 */
const extractAuthPayload = (responseData) => {
  if (!responseData) return { token: null, user: null };
  const container = responseData.data && (responseData.data.token || responseData.data.user)
    ? responseData.data
    : responseData;

  return {
    token: container.token || null,
    user: container.user || null,
  };
};

/**
 * Normaliza errores de Axios provenientes de /api/auth/* para mostrar
 * mensajes claros en los formularios de Login y Registro.
 */
const normalizeAuthError = (err, fallbackMessage) => {
  const status = err?.response?.status;
  const data = err?.response?.data;
  const backendErrors = data?.errores;

  const detailedMessage =
    Array.isArray(backendErrors) && backendErrors.length > 0
      ? backendErrors.join(' ')
      : data?.message;

  const message = detailedMessage || err?.message || fallbackMessage;
  const error = new Error(message);
  if (status) error.status = status;
  if (Array.isArray(backendErrors)) error.errores = backendErrors;
  return error;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Sincronizar el header Authorization: Bearer <token> en apiClient y localStorage
  useEffect(() => {
    try {
      if (token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
      } else {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        delete apiClient.defaults.headers.common.Authorization;
      }
    } catch (e) {
      console.error('Error al sincronizar token en localStorage:', e);
    }
  }, [token]);

  // Sincronizar datos del usuario en localStorage
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Error al sincronizar usuario en localStorage:', e);
    }
  }, [user]);

  /**
   * Registro de usuario: POST /api/auth/register
   * Acepta un objeto { nombre, email, password } o parámetros (nombre, email, password).
   */
  const register = useCallback(async (arg1, arg2, arg3) => {
    setLoading(true);
    setAuthError(null);

    const payload =
      typeof arg1 === 'object' && arg1 !== null
        ? {
            nombre: arg1.nombre,
            email: arg1.email,
            password: arg1.password,
          }
        : {
            nombre: arg1,
            email: arg2,
            password: arg3,
          };

    try {
      const response = await apiClient.post('/auth/register', payload);
      const { token: newToken, user: newUser } = extractAuthPayload(response.data);

      if (newToken && newUser) {
        const enrichedUser = {
          ...newUser,
          createdAt: newUser.createdAt || new Date().toISOString(),
        };
        apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        setToken(newToken);
        setUser(enrichedUser);
      }

      return response.data;
    } catch (err) {
      const normalized = normalizeAuthError(
        err,
        'No se pudo completar el registro. Verificá los datos e intentá nuevamente.'
      );
      setAuthError(normalized.message);
      throw normalized;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Inicio de sesión: POST /api/auth/login
   * Acepta (email, password) o un objeto ({ email, password }).
   */
  const login = useCallback(async (arg1, arg2) => {
    setLoading(true);
    setAuthError(null);

    const payload =
      typeof arg1 === 'object' && arg1 !== null
        ? { email: arg1.email, password: arg1.password }
        : { email: arg1, password: arg2 };

    try {
      const response = await apiClient.post('/auth/login', payload);
      const { token: newToken, user: loggedUser } = extractAuthPayload(response.data);

      if (newToken && loggedUser) {
        apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        setToken(newToken);
        setUser(loggedUser);
      }

      return response.data;
    } catch (err) {
      const normalized = normalizeAuthError(
        err,
        'No se pudo iniciar sesión. Verificá tus credenciales.'
      );
      setAuthError(normalized.message);
      throw normalized;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cierre de sesión: limpia estado y almacenamiento local
   */
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setAuthError(null);
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      // Ignorar errores de acceso a storage
    }
    delete apiClient.defaults.headers.common.Authorization;
  }, []);

  const isAuthenticated = Boolean(token && user);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      authError,
      isAuthenticated,
      login,
      register,
      logout,
      setUser,
    }),
    [user, token, loading, authError, isAuthenticated, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de un <AuthProvider>');
  }
  return context;
};

export default AuthContext;
