const mongoose = require('mongoose');

/**
 * Esquema de Producto - Mueblería Hermanos Jota (Sprint 5 y 6)
 * Modela los muebles del catálogo con soporte para especificaciones técnicas,
 * control de stock, categorías, variantes visuales (swatches), relaciones (ref) y compatibilidad con el frontend.
 */
const productoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del producto es obligatorio'],
      trim: true,
    },
    title: {
      type: String,
      trim: true,
    },
    categoria: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      trim: true,
      lowercase: true,
      index: true,
    },
    category: {
      type: String,
      trim: true,
      lowercase: true,
    },
    categoriaRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Categoria',
      default: null,
      index: true,
    },
    precio: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },
    price: {
      type: Number,
      min: [0, 'El precio no puede ser negativo'],
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción corta es obligatoria'],
      trim: true,
    },
    descripcionLarga: {
      type: String,
      trim: true,
    },
    imagen: {
      type: String,
      required: [true, 'La URL o ruta de la imagen es obligatoria'],
      trim: true,
    },
    imagenUrl: {
      type: String,
      trim: true,
    },
    foto: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    medidas: {
      type: String,
      trim: true,
    },
    materiales: {
      type: String,
      trim: true,
    },
    material: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    badge: {
      type: String,
      default: null,
      trim: true,
    },
    swatches: {
      type: [String],
      default: [],
    },
    stockLabel: {
      type: String,
      default: null,
      trim: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'El stock no puede ser menor a cero'],
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    destacado: {
      type: Boolean,
      default: false,
      index: true,
    },
    specs: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Middleware pre-guardado para sincronizar automáticamente alias en inglés / español (en creación y actualización)
productoSchema.pre('save', function () {
  if (this.isModified('nombre') || !this.title) this.title = this.nombre;
  else if (this.isModified('title') && !this.isModified('nombre')) this.nombre = this.title;

  if (this.isModified('categoria') || !this.category) this.category = this.categoria;
  else if (this.isModified('category') && !this.isModified('categoria')) this.categoria = this.category;

  if (this.isModified('precio') || this.price === undefined) this.price = this.precio;
  else if (this.isModified('price') && !this.isModified('precio')) this.precio = this.price;

  if (this.isModified('imagen') || !this.imagenUrl || !this.foto || !this.image) {
    const img = this.imagen || this.imagenUrl || this.foto || this.image;
    if (img) {
      this.imagen = img;
      this.imagenUrl = img;
      this.foto = img;
      this.image = img;
    }
  } else if (this.isModified('imagenUrl') || this.isModified('image') || this.isModified('foto')) {
    const img = this.imagenUrl || this.image || this.foto || this.imagen;
    if (img) {
      this.imagen = img;
      this.imagenUrl = img;
      this.foto = img;
      this.image = img;
    }
  }

  if (this.stock !== undefined) this.inStock = this.stock > 0;
});

const Producto = mongoose.model('Producto', productoSchema);

module.exports = Producto;
