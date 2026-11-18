const mongoose = require('mongoose');
const Producto = require('../models/Producto');
const Categoria = require('../models/Categoria');

/**
 * Controlador de Productos - Mueblería Hermanos Jota (Sprint 5 y 6)
 *
 * Sprint 5: Operaciones de lectura contra MongoDB Atlas mediante Mongoose y relaciones con Categoria (ref).
 * Sprint 6: Mutaciones (POST, PUT, DELETE) y validaciones contra MongoDB Atlas (Integrante 2 - Emanuel Ramirez).
 */

/**
 * @desc    Obtener el listado completo de productos del catálogo desde MongoDB (con soporte de filtros y populate)
 * @route   GET /api/productos
 * @access  Público
 */
const obtenerProductos = async (req, res, next) => {
  try {
    const { categoria, destacados } = req.query;
    const filtro = {};

    // Filtro opcional por categoría (insensible a mayúsculas/minúsculas)
    if (categoria) {
      filtro.categoria = categoria.trim().toLowerCase();
    }

    // Filtro opcional por productos destacados
    if (destacados === 'true') {
      filtro.destacado = true;
    }

    const productos = await Producto.find(filtro)
      .populate('categoriaRef')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: productos.length,
      data: productos,
    });
  } catch (error) {
    return next
      ? next(error)
      : res.status(500).json({
          success: false,
          status: 500,
          message: 'Error al recuperar los productos del catálogo.',
          error: error.message,
        });
  }
};

/**
 * @desc    Obtener un producto individual por su _id de MongoDB (con populate de categoría)
 * @route   GET /api/productos/:id
 * @access  Público
 */
const obtenerProductoPorId = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validación 400: verificar que el parámetro recibido sea un ObjectId válido de MongoDB
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: 'El parámetro "id" no tiene un formato de ObjectId válido.',
      });
    }

    // Búsqueda del producto por _id en MongoDB con población del modelo referenciado
    const producto = await Producto.findById(id).populate('categoriaRef');

    // Validación 404: si el producto no existe en la colección
    if (!producto) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: `Producto con ID ${id} no encontrado en el catálogo.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: producto,
    });
  } catch (error) {
    return next
      ? next(error)
      : res.status(500).json({
          success: false,
          status: 500,
          message: `Error al obtener el producto con ID ${req.params.id}.`,
          error: error.message,
        });
  }
};

/**
 * =========================================================================
 * MUTACIONES (POST, PUT, DELETE) - INTEGRANTE 2 (Emanuel Ramirez)
 * =========================================================================
 */

/**
 * @desc    Dar de alta un nuevo producto en la base de datos con vinculación relacional
 * @route   POST /api/productos
 * @access  Público / Administrativo
 * @status  201 Created
 */
const crearProducto = async (req, res, next) => {
  try {
    const {
      nombre,
      title,
      categoria,
      category,
      categoriaRef,
      precio,
      price,
      descripcion,
      descripcionLarga,
      imagen,
      imagenUrl,
      foto,
      image,
      medidas,
      materiales,
      material,
      tags,
      badge,
      swatches,
      stockLabel,
      stock,
      destacado,
      specs,
    } = req.body;

    const imagenResuelta = imagen || imagenUrl || foto || image;
    const catNombre = (categoria || category || 'almacenaje').toLowerCase();

    // Resolver automáticamente la referencia a Categoria si no se pasó explícitamente
    let resolvedCategoriaRef = categoriaRef || null;
    if (!resolvedCategoriaRef && catNombre) {
      const catDoc = await Categoria.findOne({ nombre: catNombre });
      if (catDoc) {
        resolvedCategoriaRef = catDoc._id;
      }
    }

    // Construcción del nuevo documento siguiendo el modelo Mongoose
    const nuevoProducto = new Producto({
      nombre: nombre || title,
      title: title || nombre,
      categoria: catNombre,
      category: catNombre,
      categoriaRef: resolvedCategoriaRef,
      precio: precio !== undefined ? precio : price,
      price: price !== undefined ? price : precio,
      descripcion,
      descripcionLarga: descripcionLarga || descripcion,
      imagen: imagenResuelta,
      imagenUrl: imagenUrl || imagenResuelta,
      foto: foto || imagenResuelta,
      image: image || imagenResuelta,
      medidas: medidas || '',
      materiales: materiales || material || '',
      material: material || materiales || '',
      tags: Array.isArray(tags) ? tags : [],
      badge: badge || null,
      swatches: Array.isArray(swatches) ? swatches : [],
      stockLabel: stockLabel || null,
      stock: stock !== undefined ? Number(stock) : 0,
      inStock: stock !== undefined ? Number(stock) > 0 : true,
      destacado: Boolean(destacado),
      specs: specs || {},
    });

    const productoGuardado = await nuevoProducto.save();
    await productoGuardado.populate('categoriaRef');

    return res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente en la base de datos.',
      data: productoGuardado,
    });
  } catch (error) {
    return next
      ? next(error)
      : res.status(500).json({
          success: false,
          status: 500,
          message: 'Error al dar de alta el producto.',
          error: error.message,
        });
  }
};

/**
 * @desc    Modificar la información de un producto existente por su ID
 * @route   PUT /api/productos/:id
 * @access  Público / Administrativo
 * @status  200 OK
 */
const actualizarProducto = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Buscar el producto existente
    const producto = await Producto.findById(id);

    if (!producto) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: `Producto con ID "${id}" no encontrado para actualizar.`,
      });
    }

    // Campos permitidos para actualización
    const camposPermitidos = [
      'nombre',
      'title',
      'categoria',
      'category',
      'categoriaRef',
      'precio',
      'price',
      'descripcion',
      'descripcionLarga',
      'imagen',
      'imagenUrl',
      'foto',
      'image',
      'medidas',
      'materiales',
      'material',
      'tags',
      'badge',
      'swatches',
      'stockLabel',
      'stock',
      'destacado',
      'specs',
    ];

    // Aplicar únicamente los campos presentes en req.body
    camposPermitidos.forEach((campo) => {
      if (req.body[campo] !== undefined) {
        producto[campo] = req.body[campo];
      }
    });

    // Si se actualizó la categoría como string y no se pasó categoriaRef, sincronizarla
    if ((req.body.categoria || req.body.category) && req.body.categoriaRef === undefined) {
      const nuevoCatNombre = (req.body.categoria || req.body.category).toLowerCase().trim();
      const catDoc = await Categoria.findOne({ nombre: nuevoCatNombre });
      if (catDoc) {
        producto.categoriaRef = catDoc._id;
      }
    }

    // Guardar para ejecutar validadores y el middleware pre('save') del schema
    const productoActualizado = await producto.save();
    await productoActualizado.populate('categoriaRef');

    return res.status(200).json({
      success: true,
      message: 'Producto actualizado exitosamente en la base de datos.',
      data: productoActualizado,
    });
  } catch (error) {
    return next
      ? next(error)
      : res.status(500).json({
          success: false,
          status: 500,
          message: 'Error al actualizar el producto.',
          error: error.message,
        });
  }
};

/**
 * @desc    Remover un producto existente de la base de datos por su ID
 * @route   DELETE /api/productos/:id
 * @access  Público / Administrativo
 * @status  200 OK
 */
const eliminarProducto = async (req, res, next) => {
  try {
    const { id } = req.params;

    const productoEliminado = await Producto.findByIdAndDelete(id);

    if (!productoEliminado) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: `Producto con ID "${id}" no encontrado para eliminar.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Producto eliminado exitosamente de la base de datos.',
      data: productoEliminado,
    });
  } catch (error) {
    return next
      ? next(error)
      : res.status(500).json({
          success: false,
          status: 500,
          message: 'Error al eliminar el producto.',
          error: error.message,
        });
  }
};

module.exports = {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
};
