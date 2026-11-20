const mongoose = require('mongoose');
const User = require('../models/User');
const { verifyToken } = require('../utils/jwt');

/**
 * Middleware de autorización JWT.
 * Valida el header `Authorization: Bearer <token>` e inyecta el usuario
 * autenticado en `req.user` sin incluir la contraseña.
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      typeof authHeader !== 'string' ||
      !authHeader.startsWith('Bearer ')
    ) {
      return res.status(401).json({
        success: false,
        status: 401,
        message: 'Acceso no autorizado. Token no proporcionado.',
      });
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      return res.status(401).json({
        success: false,
        status: 401,
        message: 'Acceso no autorizado. Formato de token Bearer inválido.',
      });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          status: 401,
          message: 'El token de sesión expiró. Iniciá sesión nuevamente.',
        });
      }

      if (
        jwtError.name === 'JsonWebTokenError' ||
        jwtError.name === 'NotBeforeError'
      ) {
        return res.status(401).json({
          success: false,
          status: 401,
          message: 'El token de autenticación es inválido.',
        });
      }

      // Error de configuración del servidor (ej. JWT_SECRET faltante)
      return next(jwtError);
    }

    if (!decoded?.id || !mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(401).json({
        success: false,
        status: 401,
        message: 'El token de autenticación contiene un identificador inválido.',
      });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        status: 401,
        message: 'Usuario no encontrado o sesión inválida.',
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = authMiddleware;
