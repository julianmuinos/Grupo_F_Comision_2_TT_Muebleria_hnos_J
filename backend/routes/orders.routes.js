const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/orders.controller');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * Rutas de Pedidos (Orders) - Integrante 2 (Emanuel Ramirez)
 * Todas las rutas están protegidas mediante authMiddleware.
 */

// Aplicar authMiddleware a todas las rutas de este router
router.use(authMiddleware);

/**
 * @route   POST /api/orders
 * @desc    Crear un pedido a partir del carrito validando stock y calculando precios en servidor
 * @access  Privado (Usuario autenticado)
 * @status  201 Created
 */
router.post('/', ordersController.crearPedido);

/**
 * @route   GET /api/orders/my-orders
 * @desc    Obtener únicamente los pedidos del usuario autenticado ordenados del más reciente al más antiguo
 * @access  Privado (Usuario autenticado)
 * @status  200 OK
 */
router.get('/my-orders', ordersController.obtenerMisPedidos);

/**
 * @route   GET /api/orders/:id
 * @desc    Obtener detalle de un pedido propio
 * @access  Privado (Usuario autenticado)
 * @status  200 OK
 */
router.get('/:id', ordersController.obtenerPedidoPorId);

module.exports = router;
