const mongoose = require('mongoose');

/**
 * Subesquema de Ítem de Pedido
 * Guarda un snapshot del producto al momento de comprar (nombre, precio unitario real)
 * para garantizar la inmutabilidad histórica del pedido ante cambios futuros en el catálogo.
 */
const orderItemSchema = new mongoose.Schema(
  {
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producto',
      required: [true, 'La referencia al producto es obligatoria'],
    },
    nombre: {
      type: String,
      required: [true, 'El nombre del producto (snapshot) es obligatorio'],
      trim: true,
    },
    precio: {
      type: Number,
      required: [true, 'El precio unitario (snapshot) es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },
    cantidad: {
      type: Number,
      required: [true, 'La cantidad es obligatoria'],
      min: [1, 'La cantidad debe ser al menos 1'],
      default: 1,
    },
    imagen: {
      type: String,
      default: '',
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'El subtotal no puede ser negativo'],
    },
  },
  { _id: false }
);

/**
 * Esquema de Order / Pedido - Mueblería Hermanos Jota
 * Cumple con los requerimientos de la actividad:
 * - user: referencia obligatoria a 'User'
 * - items: array de items con snapshot de producto, nombre, precio, cantidad
 * - total: importe total calculado en servidor
 * - estado: ciclo de vida del pedido
 * - timestamps: createdAt y updatedAt
 */
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'La referencia al usuario autenticado es obligatoria'],
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: [true, 'El pedido debe contener al menos un ítem'],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message:
          'El pedido no puede estar vacío (se requiere al menos 1 ítem).',
      },
    },
    total: {
      type: Number,
      required: [true, 'El monto total es obligatorio'],
      min: [0, 'El total no puede ser negativo'],
    },
    estado: {
      type: String,
      enum: [
        'pendiente',
        'pagado',
        'en preparacion',
        'enviado',
        'entregado',
        'cancelado',
      ],
      default: 'pendiente',
      index: true,
    },
    metodoPago: {
      type: String,
      enum: ['transferencia', 'tarjeta', 'efectivo', 'mercado_pago'],
      default: 'transferencia',
    },
    direccionEnvio: {
      calle: { type: String, default: '' },
      ciudad: { type: String, default: '' },
      codigoPostal: { type: String, default: '' },
      notas: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Índice compuesto para consultas eficientes de pedidos por usuario ordenados por fecha
orderSchema.index({ user: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
