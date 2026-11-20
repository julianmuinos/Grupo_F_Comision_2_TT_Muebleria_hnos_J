const jwt = require('jsonwebtoken');

/**
 * Obtiene y valida la clave secreta JWT desde variables de entorno.
 * Nunca utiliza secretos hardcodeados.
 * @returns {string}
 */
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || typeof secret !== 'string' || secret.trim().length === 0) {
    throw new Error(
      'La variable de entorno JWT_SECRET no está configurada. Verificá tu archivo .env.'
    );
  }
  return secret;
};

/**
 * Obtiene la duración de expiración del token desde JWT_EXPIRES_IN.
 * @returns {string}
 */
const getJwtExpiresIn = () => {
  const expiresIn = process.env.JWT_EXPIRES_IN;
  return expiresIn && expiresIn.trim().length > 0 ? expiresIn.trim() : '7d';
};

/**
 * Firma un JSON Web Token con el payload indicado.
 * @param {{ id: string, email?: string }} payload
 * @returns {string}
 */
const signToken = (payload) => {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: getJwtExpiresIn(),
  });
};

/**
 * Verifica y decodifica un JSON Web Token.
 * Lanza JsonWebTokenError o TokenExpiredError si el token es inválido o expiró.
 * @param {string} token
 * @returns {jwt.JwtPayload | string}
 */
const verifyToken = (token) => {
  return jwt.verify(token, getJwtSecret());
};

module.exports = {
  signToken,
  verifyToken,
};
