const mongoose = require('mongoose');
const Order = require('../models/Order');
const Producto = require('../models/Producto');

/**
 * Controlador de Pedidos (Orders) - Integrante 2 (Emanuel Ramirez)
 *
 * Conecta la lógica de negocio de pedidos con el usuario autenticado:
 * - Siempre asocia el pedido a req.user.id (extraído del JWT)
 * - Consulta los precios reales de los muebles en MongoDB para calcular el total en el servidor
 * - Valida stock y disponibilidad
 * - Devuelve los pedidos del usuario ordenados cronológicamente
 */

/**
 * @desc    Crear un nuevo pedido a partir de los ítems del carrito
 * @route   POST /api/orders
 * @access  Privado (requiere authMiddleware)
 * @status  201 Created
 */
const crearPedido = async (req, res, next) => {
  try {
    // SEGURIDAD CRÍTICA: Se extrae el ID del usuario exclusivamente desde req.user inyectado por el JWT
    const userId = req.user._id || req.user.id;

    const { items, metodoPago, direccionEnvio } = req.body;

    // 1. Validación de carrito no vacío
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        status: 400,
        message:
          'El pedido no puede estar vacío. Debes enviar al menos un producto.',
      });
    }

    // 2. Extraer y validar los IDs de productos enviados
    const itemsProcesados = [];
    let totalCalculado = 0;

    for (const item of items) {
      const productoId =
        item.producto || item.productoId || item.id || item._id;
      const cantidad = parseInt(item.cantidad, 10);

      if (!productoId || !mongoose.Types.ObjectId.isValid(productoId)) {
        return res.status(400).json({
          success: false,
          status: 400,
          message: `El identificador de producto "${productoId}" no es un ObjectId válido de MongoDB.`,
        });
      }

      if (isNaN(cantidad) || cantidad <= 0) {
        return res.status(400).json({
          success: false,
          status: 400,
          message: `La cantidad solicitada para el producto (${cantidad}) debe ser un número entero mayor a 0.`,
        });
      }

      // CONSULTA CRÍTICA EN SERVIDOR: Buscar el mueble en MongoDB Atlas para tomar precio y nombre reales
      const productoBD = await Producto.findById(productoId);

      if (!productoBD) {
        return res.status(404).json({
          success: false,
          status: 404,
          message: `El producto con ID "${productoId}" no existe en el catálogo oficial.`,
        });
      }

      // Validar stock si el producto tiene control de inventario
      if (typeof productoBD.stock === 'number' && productoBD.stock < cantidad) {
        return res.status(400).json({
          success: false,
          status: 400,
          message: `Stock insuficiente para "${productoBD.nombre}". Disponible: ${productoBD.stock}, Solicitado: ${cantidad}.`,
        });
      }

      // Precio real del catálogo (servidor-side)
      const precioReal = Number(
        productoBD.precio !== undefined ? productoBD.precio : productoBD.price
      );
      const subtotalItem = precioReal * cantidad;
      totalCalculado += subtotalItem;

      itemsProcesados.push({
        producto: productoBD._id,
        nombre: productoBD.nombre || productoBD.title,
        precio: precioReal,
        cantidad,
        imagen:
          productoBD.imagen ||
          productoBD.imagenUrl ||
          productoBD.foto ||
          productoBD.image ||
          '',
        subtotal: subtotalItem,
      });
    }

    // 3. Crear y persistir el pedido en MongoDB Atlas
    const nuevoPedido = new Order({
      user: userId, // Asociación garantizada al usuario autenticado
      items: itemsProcesados,
      total: totalCalculado, // Total real calculado en el servidor
      estado: 'pendiente',
      metodoPago: metodoPago || 'transferencia',
      direccionEnvio: direccionEnvio || req.user.direccion || {},
    });

    const pedidoGuardado = await nuevoPedido.save();

    // Actualizar stock de los productos vendidos
    for (const item of itemsProcesados) {
      await Producto.findByIdAndUpdate(item.producto, {
        $inc: { stock: -item.cantidad },
      }).catch((err) => {
        console.error(
          `Error al descontar stock del producto ${item.producto}:`,
          err.message
        );
      });
    }

    // Poblar datos del usuario para la respuesta
    await pedidoGuardado.populate('user', 'nombre email telefono');

    return res.status(201).json({
      success: true,
      message: 'Pedido generado exitosamente.',
      data: pedidoGuardado,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Consultar y devolver únicamente los pedidos del usuario autenticado
 * @route   GET /api/orders/my-orders
 * @access  Privado (requiere authMiddleware)
 */
const obtenerMisPedidos = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    // Consulta filtrada exclusivamente por el usuario autenticado y ordenada del más reciente al más antiguo
    const pedidos = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('items.producto', 'nombre categoria imagen precio');

    return res.status(200).json({
      success: true,
      total: pedidos.length,
      data: pedidos,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Consultar detalle de un pedido específico del usuario
 * @route   GET /api/orders/:id
 * @access  Privado (requiere authMiddleware)
 */
const obtenerPedidoPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: 'El identificador de pedido no es un ObjectId válido.',
      });
    }

    const pedido = await Order.findById(id).populate(
      'items.producto',
      'nombre categoria imagen'
    );

    if (!pedido) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: 'Pedido no encontrado.',
      });
    }

    // Garantizar que un cliente no pueda ver pedidos ajenos
    if (
      pedido.user.toString() !== userId.toString() &&
      req.user.rol !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        status: 403,
        message: 'No tienes autorización para consultar este pedido.',
      });
    }

    return res.status(200).json({
      success: true,
      data: pedido,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  crearPedido,
  obtenerMisPedidos,
  obtenerPedidoPorId,
};
