const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generarToken = (id) => {
  const jwtSecret = process.env.JWT_SECRET || 'muebleria_secret_key_2026_dev';
  return jwt.sign({ id }, jwtSecret, { expiresIn: '7d' });
};

/**
 * @desc    Registro de un nuevo usuario
 * @route   POST /api/auth/register
 * @access  Público
 */
const register = async (req, res, next) => {
  try {
    const { nombre, email, password, telefono, direccion } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: 'Por favor proporciona nombre, email y contraseña.',
      });
    }

    const usuarioExistente = await User.findOne({ email: email.toLowerCase() });
    if (usuarioExistente) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: 'El correo electrónico ya se encuentra registrado.',
      });
    }

    const user = await User.create({
      nombre,
      email: email.toLowerCase(),
      password,
      telefono: telefono || '',
      direccion: direccion || {},
    });

    const token = generarToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente.',
      data: {
        token,
        user: {
          _id: user._id,
          id: user._id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol,
          telefono: user.telefono,
          direccion: user.direccion,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Iniciar sesión y obtener token JWT
 * @route   POST /api/auth/login
 * @access  Público
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: 'Por favor ingresa email y contraseña.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password'
    );

    if (!user || !(await user.compararPassword(password))) {
      return res.status(401).json({
        success: false,
        status: 401,
        message: 'Credenciales inválidas. Verifica tu email y contraseña.',
      });
    }

    const token = generarToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso.',
      data: {
        token,
        user: {
          _id: user._id,
          id: user._id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol,
          telefono: user.telefono,
          direccion: user.direccion,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Devolver la información del usuario autenticado (req.user)
 * @route   GET /api/auth/profile
 * @access  Privado (requiere authMiddleware)
 */
const getProfile = async (req, res, next) => {
  try {
    // req.user ya fue inyectado por el middleware de autenticación
    return res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
};
