const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Esquema de Usuario (User) - Mueblería Hermanos Jota
 * Modela las cuentas de clientes y administradores con autenticación por JWT.
 */
const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre completo es obligatorio'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'El correo electrónico es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Por favor ingresa un email válido',
      ],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [6, 'La contraseña debe contener al menos 6 caracteres'],
      select: false, // Por seguridad no se incluye en consultas por defecto
    },
    rol: {
      type: String,
      enum: ['cliente', 'admin'],
      default: 'cliente',
    },
    telefono: {
      type: String,
      trim: true,
      default: '',
    },
    direccion: {
      calle: { type: String, default: '' },
      ciudad: { type: String, default: '' },
      codigoPostal: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Hashear la contraseña antes de guardar el documento
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Método de instancia para comparar contraseñas
userSchema.methods.compararPassword = async function (passwordIngresada) {
  return bcrypt.compare(passwordIngresada, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
