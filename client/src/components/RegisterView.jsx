import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Componente RegisterView (/registro)
 * Formulario 100% controlado (nombre, email, contraseña y confirmación de contraseña)
 * con validaciones en cliente alineadas con POST /api/auth/register:
 * - nombre: obligatorio, mínimo 2 caracteres
 * - email: obligatorio, formato válido
 * - password: obligatoria, mínimo 5 caracteres
 * - confirmPassword: obligatoria, debe coincidir con password
 */
const RegisterView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isAuthenticated } = useAuth();

  // Redirección post-registro a Inicio ('/') o ruta protegida previa
  const redirectPath = location.state?.from?.pathname || '/';

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Si ya inició sesión, redirigir al destino
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectPath]);

  const validateField = (name, value, currentForm = formData) => {
    switch (name) {
      case 'nombre': {
        const clean = String(value || '').trim();
        if (!clean) return 'El nombre completo es obligatorio.';
        if (clean.length < 2)
          return 'El nombre debe tener al menos 2 caracteres.';
        return '';
      }
      case 'email': {
        const clean = String(value || '').trim();
        if (!clean) return 'El correo electrónico es obligatorio.';
        if (!EMAIL_REGEX.test(clean))
          return 'El formato del correo electrónico no es válido.';
        return '';
      }
      case 'password': {
        if (!value || String(value).length === 0)
          return 'La contraseña es obligatoria.';
        if (String(value).length < 5)
          return 'La contraseña debe tener al menos 5 caracteres.';
        return '';
      }
      case 'confirmPassword': {
        if (!value || String(value).length === 0)
          return 'Debés confirmar tu contraseña.';
        if (value !== currentForm.password)
          return 'Las contraseñas no coinciden.';
        return '';
      }
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextForm = { ...formData, [name]: value };
    setFormData(nextForm);

    if (submitError) setSubmitError(null);

    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value, nextForm),
      }));
    }

    // Revalidar confirmPassword si cambia password y confirmPassword ya fue tocado
    if (name === 'password' && touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateField(
          'confirmPassword',
          nextForm.confirmPassword,
          nextForm
        ),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value, formData),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    setTouched({
      nombre: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    const validationErrors = {};
    ['nombre', 'email', 'password', 'confirmPassword'].forEach((field) => {
      const msg = validateField(field, formData[field], formData);
      if (msg) validationErrors[field] = msg;
    });

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        nombre: formData.nombre.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      navigate(redirectPath, { replace: true });
    } catch (err) {
      setSubmitError(
        err.message ||
          'No se pudo registrar la cuenta. Verificá los datos e intentá nuevamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-page-section" aria-labelledby="register-heading">
      <div className="auth-card-wrapper">
        <div className="auth-brand-Header">
          <span className="section-badge">Comunidad · Hermanos Jota</span>
          <h1 id="register-heading" className="auth-main-title">
            Crear Cuenta
          </h1>
          <p className="auth-main-subtitle">
            Registrate para guardar tus muebles favoritos, realizar pedidos y consultar el historial de tus compras.
          </p>
        </div>

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
              <strong>No se pudo completar el registro:</strong> {submitError}
            </div>
          </div>
        )}

        <form className="contact-form-heritage auth-form" onSubmit={handleSubmit} noValidate>
          {/* Nombre completo */}
          <div className={`form-group ${touched.nombre && errors.nombre ? 'has-error' : ''}`}>
            <label htmlFor="register-nombre" className="form-label">
              Nombre Completo <span className="required-mark">*</span>
            </label>
            <input
              id="register-nombre"
              name="nombre"
              type="text"
              autoComplete="name"
              placeholder="Ej. María Gómez"
              className={`form-input ${touched.nombre && errors.nombre ? 'input-error' : ''}`}
              value={formData.nombre}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              required
            />
            {touched.nombre && errors.nombre && (
              <span className="field-error" role="alert">
                {errors.nombre}
              </span>
            )}
          </div>

          {/* Email */}
          <div className={`form-group ${touched.email && errors.email ? 'has-error' : ''}`}>
            <label htmlFor="register-email" className="form-label">
              Correo Electrónico <span className="required-mark">*</span>
            </label>
            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="maria@ejemplo.com"
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
            <label htmlFor="register-password" className="form-label">
              Contraseña <span className="required-mark">*</span>
            </label>
            <div className="password-input-wrapper">
              <input
                id="register-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Mínimo 5 caracteres"
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

          {/* Confirmación de Contraseña */}
          <div
            className={`form-group ${
              touched.confirmPassword && errors.confirmPassword ? 'has-error' : ''
            }`}
          >
            <label htmlFor="register-confirm-password" className="form-label">
              Confirmar Contraseña <span className="required-mark">*</span>
            </label>
            <input
              id="register-confirm-password"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Repetí tu contraseña"
              className={`form-input ${
                touched.confirmPassword && errors.confirmPassword ? 'input-error' : ''
              }`}
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              required
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <span className="field-error" role="alert">
                {errors.confirmPassword}
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
                Creando cuenta...
              </>
            ) : (
              'Crear mi cuenta'
            )}
          </button>
        </form>

        <div className="auth-footer-switch">
          <p>
            ¿Ya tenés una cuenta registrada?{' '}
            <Link to="/login" className="auth-switch-link">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default RegisterView;
