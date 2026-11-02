const express = require('express');
const router = express.Router();
const Categoria = require('../models/Categoria');

/**
 * @route   GET /api/categorias
 * @desc    Obtener todas las categorías oficiales de productos
 * @access  Público
 */
router.get('/', async (req, res, next) => {
  try {
    const categorias = await Categoria.find().sort({ nombre: 1 });
    return res.status(200).json({
      success: true,
      total: categorias.length,
      data: categorias,
    });
  } catch (error) {
    return next
      ? next(error)
      : res.status(500).json({
          success: false,
          status: 500,
          message: 'Error al recuperar las categorías.',
          error: error.message,
        });
  }
});

module.exports = router;

