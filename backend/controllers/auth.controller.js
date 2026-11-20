const User = require('../models/User');
const { signToken } = require('../utils/jwt');

/**
 * @desc    Registrar un nuevo usuario y emitir token JWT
 * @route   POST /api/auth/register
 * @access  Público
 */
const register = async (req, res, next) => {
  try {
    const { nombre, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        status: 409,
        message: 'Ya existe un usuario registrado con ese correo electrónico.',
      });
    }

    const user = new User({ nombre, email, password });
    await user.save();

    const token = signToken({
      id: user._id.toString(),
      email: user.email,
    });

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente.',
      token,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        status: 409,
        message: 'Ya existe un usuario registrado con ese correo electrónico.',
      });
    }
    return next(error);
  }
};

/**
 * @desc    Autenticar usuario existente y emitir token JWT
 * @route   POST /api/auth/login
 * @access  Público
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        status: 401,
        message: 'Credenciales inválidas. Verificá tu email y contraseña.',
      });
    }

    const token = signToken({
      id: user._id.toString(),
      email: user.email,
    });

    return res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso.',
      token,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
};
