const mongoose = require('mongoose');

/**
 * Middlewares de Validación para el Catálogo de Productos
 * Implementado por Integrante 2 - Backend: Mutaciones y Validaciones
 */

/**
 * Valida que el ID provisto en req.params sea un ObjectId válido de MongoDB.
 */
const validarIdMongo = (req, res, next) => {
  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: `El parámetro "id" ('${id}') no es un identificador válido de MongoDB (ObjectId).`,
    });
  }

  next();
};

/**
 * Valida los datos requeridos para la creación de un nuevo producto (POST /api/productos).
 * Valida presencia, tipos y coherencia de datos (ej. precio >= 0, stock >= 0).
 */
const validarCrearProducto = (req, res, next) => {
  const errores = [];
  const {
    nombre,
    title,
    categoria,
    category,
    precio,
    price,
    descripcion,
    imagen,
    imagenUrl,
    foto,
    image,
    stock,
    destacado,
    tags,
    swatches,
  } = req.body;

  // Normalización de campos clave (soporte en español e inglés y categoría por defecto para formularios de alta)
  const nombreValido = (nombre || title || '').trim();
  const categoriaValida = (categoria || category || 'almacenaje').trim();
  const descripcionValida = (descripcion || '').trim();
  const imagenValida = (imagen || imagenUrl || foto || image || '').trim();
  const precioValor = precio !== undefined ? precio : price;

  // Validación de nombre
  if (!nombreValido) {
    errores.push(
      'El campo "nombre" (o "title") es obligatorio y no puede estar vacío.'
    );
  } else if (nombreValido.length < 3) {
    errores.push('El nombre del producto debe contener al menos 3 caracteres.');
  }

  // Validación de categoría
  if (!categoriaValida) {
    errores.push(
      'El campo "categoria" (o "category") es obligatorio y no puede estar vacío.'
    );
  }

  // Validación de descripción
  if (!descripcionValida) {
    errores.push(
      'El campo "descripcion" es obligatorio y no puede estar vacío.'
    );
  }

  // Validación de imagen (soporta imagen, imagenUrl, foto o image)
  if (!imagenValida) {
    errores.push('El campo "imagenUrl" (o "imagen" / "foto" / "image") es obligatorio.');
  }

  // Validación de precio
  if (precioValor === undefined || precioValor === null || precioValor === '') {
    errores.push('El campo "precio" (o "price") es obligatorio.');
  } else if (typeof precioValor !== 'number' && isNaN(Number(precioValor))) {
    errores.push('El campo "precio" debe ser un número válido.');
  } else if (Number(precioValor) < 0) {
    errores.push('El precio no puede ser negativo.');
  }

  // Validación de stock opcional
  if (stock !== undefined && stock !== null && stock !== '') {
    if (
      isNaN(Number(stock)) ||
      Number(stock) < 0 ||
      !Number.isInteger(Number(stock))
    ) {
      errores.push(
        'El campo "stock" debe ser un número entero mayor o igual a 0.'
      );
    }
  }

  // Validación de destacado opcional
  if (destacado !== undefined && typeof destacado !== 'boolean') {
    errores.push(
      'El campo "destacado" debe ser un valor booleano (true o false).'
    );
  }

  // Validación de arrays opcionales
  if (tags !== undefined && !Array.isArray(tags)) {
    errores.push('El campo "tags" debe ser un array de textos.');
  }

  if (swatches !== undefined && !Array.isArray(swatches)) {
    errores.push('El campo "swatches" debe ser un array de colores/acabados.');
  }

  if (errores.length > 0) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'Error de validación al crear el producto.',
      errores,
    });
  }

  // Pasamos los valores normalizados a req.body para que el controlador los reciba limpios
  req.body.nombre = nombreValido;
  req.body.categoria = categoriaValida.toLowerCase();
  req.body.descripcion = descripcionValida;
  req.body.imagen = imagenValida;
  req.body.imagenUrl = imagenValida;
  req.body.precio = Number(precioValor);
  if (stock !== undefined && stock !== '') req.body.stock = Number(stock);

  next();
};

/**
 * Valida los datos para la actualización de un producto existente (PUT /api/productos/:id).
 */
const validarActualizarProducto = (req, res, next) => {
  const { id } = req.params;

  // Validar formato del ID
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: `El parámetro "id" ('${id}') no es un identificador válido de MongoDB (ObjectId).`,
    });
  }

  // Validar que el cuerpo no esté vacío
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      status: 400,
      message:
        'Debe proporcionar al menos un campo en el cuerpo de la petición para actualizar.',
    });
  }

  const errores = [];
  const {
    nombre,
    title,
    categoria,
    category,
    precio,
    price,
    descripcion,
    imagen,
    imagenUrl,
    foto,
    image,
    stock,
    destacado,
    tags,
    swatches,
  } = req.body;

  // Validaciones condicionales si los campos están presentes
  if (
    nombre !== undefined &&
    (typeof nombre !== 'string' || nombre.trim().length < 3)
  ) {
    errores.push('El campo "nombre" debe tener al menos 3 caracteres.');
  }

  if (
    title !== undefined &&
    (typeof title !== 'string' || title.trim().length < 3)
  ) {
    errores.push('El campo "title" debe tener al menos 3 caracteres.');
  }

  if (
    categoria !== undefined &&
    (typeof categoria !== 'string' || categoria.trim().length === 0)
  ) {
    errores.push('El campo "categoria" no puede estar vacío.');
  }

  if (
    category !== undefined &&
    (typeof category !== 'string' || category.trim().length === 0)
  ) {
    errores.push('El campo "category" no puede estar vacío.');
  }

  if (
    descripcion !== undefined &&
    (typeof descripcion !== 'string' || descripcion.trim().length === 0)
  ) {
    errores.push('El campo "descripcion" no puede estar vacío.');
  }

  const imagenVal =
    imagen !== undefined
      ? imagen
      : imagenUrl !== undefined
      ? imagenUrl
      : foto !== undefined
      ? foto
      : image;
  if (
    imagenVal !== undefined &&
    (typeof imagenVal !== 'string' || imagenVal.trim().length === 0)
  ) {
    errores.push('El campo de imagen no puede estar vacío.');
  } else if (imagenVal !== undefined) {
    req.body.imagen = imagenVal.trim();
    req.body.imagenUrl = imagenVal.trim();
  }

  const precioVal = precio !== undefined ? precio : price;
  if (precioVal !== undefined) {
    if (isNaN(Number(precioVal)) || Number(precioVal) < 0) {
      errores.push('El precio debe ser un número mayor o igual a 0.');
    } else {
      req.body.precio = Number(precioVal);
    }
  }

  if (stock !== undefined) {
    if (
      isNaN(Number(stock)) ||
      Number(stock) < 0 ||
      !Number.isInteger(Number(stock))
    ) {
      errores.push(
        'El campo "stock" debe ser un número entero mayor o igual a 0.'
      );
    } else {
      req.body.stock = Number(stock);
    }
  }

  if (destacado !== undefined && typeof destacado !== 'boolean') {
    errores.push(
      'El campo "destacado" debe ser un valor booleano (true o false).'
    );
  }

  if (tags !== undefined && !Array.isArray(tags)) {
    errores.push('El campo "tags" debe ser un array.');
  }

  if (swatches !== undefined && !Array.isArray(swatches)) {
    errores.push('El campo "swatches" debe ser un array.');
  }

  if (errores.length > 0) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'Error de validación al actualizar el producto.',
      errores,
    });
  }

  next();
};

module.exports = {
  validarIdMongo,
  validarCrearProducto,
  validarActualizarProducto,
};
