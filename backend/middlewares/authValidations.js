const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Normaliza y valida email y contraseña compartidos entre registro y login.
 */
const validateAuthCredentials = (body, { minPasswordLength = 1 } = {}) => {
  const { email, password } = body || {};
  const errores = [];
  const emailLimpio =
    typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!emailLimpio) {
    errores.push('El campo "email" es obligatorio.');
  } else if (!EMAIL_REGEX.test(emailLimpio)) {
    errores.push('El formato del correo electrónico no es válido.');
  }

  if (typeof password !== 'string' || password.length === 0) {
    errores.push('El campo "password" es obligatorio.');
  } else if (minPasswordLength > 1 && password.length < minPasswordLength) {
    errores.push(
      `La contraseña debe tener al menos ${minPasswordLength} caracteres.`
    );
  }

  return { emailLimpio, errores };
};

const sendValidationErrors = (res, errores) =>
  res.status(400).json({
    success: false,
    status: 400,
    message: errores.join(' '),
    errores,
  });

/**
 * Valida y normaliza los campos requeridos para POST /api/auth/register.
 */
const validarRegistro = (req, res, next) => {
  const { nombre } = req.body || {};
  const nombreLimpio = typeof nombre === 'string' ? nombre.trim() : '';
  const { emailLimpio, errores } = validateAuthCredentials(req.body, {
    minPasswordLength: 5,
  });

  if (!nombreLimpio) {
    errores.unshift('El campo "nombre" es obligatorio.');
  } else if (nombreLimpio.length < 2) {
    errores.unshift('El nombre debe tener al menos 2 caracteres.');
  }

  if (errores.length > 0) {
    return sendValidationErrors(res, errores);
  }

  req.body.nombre = nombreLimpio;
  req.body.email = emailLimpio;
  return next();
};

/**
 * Valida y normaliza los campos requeridos para POST /api/auth/login.
 */
const validarLogin = (req, res, next) => {
  const { emailLimpio, errores } = validateAuthCredentials(req.body);

  if (errores.length > 0) {
    return sendValidationErrors(res, errores);
  }

  req.body.email = emailLimpio;
  return next();
};

module.exports = {
  validarRegistro,
  validarLogin,
};
