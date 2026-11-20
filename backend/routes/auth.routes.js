const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const {
  validarRegistro,
  validarLogin,
} = require('../middlewares/authValidations');

/**
 * Rutas de Autenticación - Mueblería Hermanos Jota
 * Endpoints públicos implementados por Alexis Fernando Rojas.
 * Nota para integración: GET /api/auth/profile será conectado usando `middlewares/authMiddleware`.
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

module.exports = router;
