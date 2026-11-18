const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

/**
 * Rutas de Autenticación - Mueblería Hermanos Jota
 */

// Rutas públicas
router.post('/register', authController.register);
router.post('/login', authController.login);

// Rutas protegidas (Endpoint solicitado: GET /api/auth/profile)
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
