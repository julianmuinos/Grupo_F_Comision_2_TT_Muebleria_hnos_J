const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Esquema de Usuario - Mueblería Hermanos Jota
 * Implementado por Alexis Fernando Rojas (Backend: Seguridad, Usuarios y Autenticación Core)
 */
const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio.'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres.'],
    },
    email: {
      type: String,
      required: [true, 'El correo electrónico es obligatorio.'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'El formato del correo electrónico no es válido.',
      ],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria.'],
      minlength: [5, 'La contraseña debe tener al menos 5 caracteres.'],
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.password;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.password;
        return ret;
      },
    },
  }
);

/**
 * Hashea automáticamente la contraseña con bcryptjs antes de persistir
 * cuando se crea el usuario o se modifica el campo password.
 */
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Compara una contraseña en texto plano contra el hash almacenado.
 * @param {string} candidatePassword
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (typeof candidatePassword !== 'string' || !this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Devuelve la representación pública del usuario (sin campos sensibles).
 * @returns {{ id: string, nombre: string, email: string }}
 */
userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id.toString(),
    nombre: this.nombre,
    email: this.email,
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;
