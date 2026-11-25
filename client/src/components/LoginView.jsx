import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Componente LoginView (/login)
 * Formulario controlado de inicio de sesión conectado con login() de AuthContext.
 * - Validación en cliente de email y contraseña
 * - Manejo de errores de la API (ej. 401 Credenciales inválidas)
 * - Indicador de carga (loading) y redirección post-login a Inicio (o ruta protegida previa)
 */
const LoginView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  // Destino post-login: ruta protegida de origen o Inicio ('/')
  const redirectPath = location.state?.from
    ? `${location.state.from.pathname || '/'}${location.state.from.search || ''}`
    : '/';
  const authNotice = location.state?.authNotice;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Si el usuario ya tiene sesión activa, redirigir automáticamente
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectPath]);

  const validateField = (name, value) => {
    switch (name) {
      case 'email': {
        const clean = String(value || '').trim();
        if (!clean) return 'El correo electrónico es obligatorio.';
        if (!EMAIL_REGEX.test(clean))
          return 'Ingresá un formato de correo electrónico válido.';
        return '';
      }
      case 'password': {
        if (!value || String(value).length === 0)
          return 'La contraseña es obligatoria.';
        return '';
      }
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (submitError) setSubmitError(null);

    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    setTouched({ email: true, password: true });

    const newErrors = {
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
    };

    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([, msg]) => Boolean(msg))
    );
    setErrors(filteredErrors);

    if (Object.keys(filteredErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await login(formData.email.trim().toLowerCase(), formData.password);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setSubmitError(
        err.message ||
          'Credenciales inválidas. Verificá tu correo electrónico y contraseña.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-page-section" aria-labelledby="login-heading">
      <div className="auth-card-wrapper">
        <div className="auth-brand-Header">
          <span className="section-badge">Acceso de Clientes · Hermanos Jota</span>
          <h1 id="login-heading" className="auth-main-title">
            Iniciar Sesión
          </h1>
          <p className="auth-main-subtitle">
            Ingresá con tu cuenta para gestionar tus pedidos, revisar tu perfil y cotizar piezas de autor.
          </p>
        </div>

        {(authNotice || location.state?.from) && (
          <div className="auth-info-banner" role="status">
            {authNotice ? (
              authNotice
            ) : (
              <>
                Iniciá sesión para acceder a <strong>{location.state.from.pathname}</strong>.
              </>
            )}
          </div>
        )}

        {submitError && (
          <div className="admin-alert-error auth-alert-error" role="alert">
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
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <strong>Error de autenticación:</strong> {submitError}
            </div>
          </div>
        )}

        <form className="contact-form-heritage auth-form" onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className={`form-group ${touched.email && errors.email ? 'has-error' : ''}`}>
            <label htmlFor="login-email" className="form-label">
              Correo Electrónico <span className="required-mark">*</span>
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="ejemplo@correo.com"
              className={`form-input ${touched.email && errors.email ? 'input-error' : ''}`}
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              required
            />
            {touched.email && errors.email && (
              <span className="field-error" role="alert">
                {errors.email}
              </span>
            )}
          </div>

          {/* Contraseña */}
          <div className={`form-group ${touched.password && errors.password ? 'has-error' : ''}`}>
            <label htmlFor="login-password" className="form-label">
              Contraseña <span className="required-mark">*</span>
            </label>
            <div className="password-input-wrapper">
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Ingresá tu contraseña"
                className={`form-input ${touched.password && errors.password ? 'input-error' : ''}`}
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isSubmitting}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                tabIndex={-1}
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            {touched.password && errors.password && (
              <span className="field-error" role="alert">
                {errors.password}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="btn-inline-spinner" aria-hidden="true" />
                Iniciando sesión...
              </>
            ) : (
              'Ingresar a mi cuenta'
            )}
          </button>
        </form>

        <div className="auth-footer-switch">
          <p>
            ¿Todavía no tenés una cuenta?{' '}
            <Link to="/registro" className="auth-switch-link">
              Registrate acá
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default LoginView;
