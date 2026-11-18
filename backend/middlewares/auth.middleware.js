const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware de Autenticación mediante JWT (Bearer Token)
 * Verifica el token enviado en el header Authorization, decodifica el payload
 * e inyecta la información del usuario en `req.user`.
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        status: 401,
        message:
          'Acceso no autorizado: No se proveyó el token de autenticación Bearer.',
      });
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET || 'muebleria_secret_key_2026_dev';

    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          status: 401,
          message:
            'El token de autenticación ha expirado. Inicia sesión nuevamente.',
        });
      }
      return res.status(401).json({
        success: false,
        status: 401,
        message: 'Token de autenticación inválido.',
      });
    }

    const userId = decoded.id || decoded._id || decoded.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        status: 401,
        message: 'Token inválido: payload sin identificador de usuario.',
      });
    }

    // Buscar el usuario en la base de datos (excluyendo password)
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        status: 401,
        message:
          'El usuario perteneciente a este token ya no existe en el sistema.',
      });
    }

    // Inyectar el usuario autenticado en la petición (con acceso a req.user.id / req.user._id)
    req.user = user;
    next();
  } catch (error) {
    return next(error);
  }
};

module.exports = authMiddleware;
