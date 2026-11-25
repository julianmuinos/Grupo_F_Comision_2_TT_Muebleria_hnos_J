const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const {
  validarRegistro,
  validarLogin,
} = require('../middlewares/authValidations');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * Rutas de Autenticación - Mueblería Hermanos Jota
 * POST /api/auth/register y POST /api/auth/login (Alexis Fernando Rojas)
 * GET /api/auth/profile (Emanuel Ramirez - Endpoint protegido usando authMiddleware de Alexis)
 */

/**
 * @route   POST /api/auth/register
 * @desc    Registro de nuevo usuario con hash bcrypt y emisión de JWT
 * @access  Público
 */
router.post('/register', validarRegistro, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login de usuario y emisión de JWT
 * @access  Público
 */
router.post('/login', validarLogin, authController.login);

/**
 * @route   GET /api/auth/profile
 * @desc    Devolver la información del usuario autenticado (req.user)
 * @access  Privado (requiere authMiddleware)
 */
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
