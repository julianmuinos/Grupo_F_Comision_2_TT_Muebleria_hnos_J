const mongoose = require('mongoose');

/**
 * Esquema de Categoría - Mueblería Hermanos Jota
 * Modela las líneas de producto del catálogo con validaciones y soporte para relaciones (ref).
 */
const categoriaSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre de la categoría es obligatorio'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },
    descripcion: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Generar slug automáticamente si no se proveyó
categoriaSchema.pre('save', function () {
  if (!this.slug && this.nombre) {
    this.slug = this.nombre
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');
  }
});

const Categoria = mongoose.model('Categoria', categoriaSchema);

module.exports = Categoria;

