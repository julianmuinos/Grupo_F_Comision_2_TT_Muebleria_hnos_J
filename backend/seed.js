const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const conectarDB = require('./config/db');
const Producto = require('./models/Producto');
const Categoria = require('./models/Categoria');
const productos = require('./data/productos');

/**
 * Categorías oficiales de Mueblería Hermanos Jota para el modelo relacional Categoria
 */
const categoriasOficiales = [
  {
    nombre: 'asientos',
    slug: 'asientos',
    descripcion: 'Sillas, sillones, butacas y sofás artesanales en madera maciza.',
  },
  {
    nombre: 'mesas',
    slug: 'mesas',
    descripcion: 'Mesas de comedor, centro y laterales con diseño atemporal.',
  },
  {
    nombre: 'almacenaje',
    slug: 'almacenaje',
    descripcion: 'Aparadores, bibliotecas y módulos de guardado noble.',
  },
  {
    nombre: 'accesorios',
    slug: 'accesorios',
    descripcion: 'Lámparas, percheros y complementos de diseño de autor.',
  },
];

/**
 * Script de sembrado - Mueblería Hermanos Jota
 * Puebla las colecciones "categorias" y "productos" estableciendo relaciones (ref).
 * Es idempotente: elimina los documentos existentes antes de insertar.
 * Uso: npm run seed
 */
const sembrarDB = async () => {
  try {
    await conectarDB();

    // 1. Limpieza de colecciones previas
    const catEliminadas = await Categoria.deleteMany({});
    const prodEliminados = await Producto.deleteMany({});
    console.log(`🧹 Categorías previas eliminadas: ${catEliminadas.deletedCount}`);
    console.log(`🧹 Productos previos eliminados:  ${prodEliminados.deletedCount}`);

    // 2. Inserción de Categorías
    const categoriasInsertadas = await Categoria.insertMany(categoriasOficiales);
    console.log(`🏷️  Categorías insertadas: ${categoriasInsertadas.length}`);

    // Mapeo rápido de nombre de categoría a su ObjectId nativo de MongoDB
    const categoriaMap = categoriasInsertadas.reduce((acc, cat) => {
      acc[cat.nombre.toLowerCase()] = cat._id;
      return acc;
    }, {});

    // 3. Preparación de Productos vinculando categoriaRef por relación (ref)
    const productosParaInsertar = productos.map(({ id, ...resto }) => {
      const catKey = (resto.categoria || '').toLowerCase().trim();
      return {
        ...resto,
        categoriaRef: categoriaMap[catKey] || null,
      };
    });

    const insertados = await Producto.insertMany(productosParaInsertar);

    const porCategoria = insertados.reduce((acc, p) => {
      acc[p.categoria] = (acc[p.categoria] || 0) + 1;
      return acc;
    }, {});

    console.log('\n' + '='.repeat(65));
    console.log('  🌱 SEED COMPLETADO - Mueblería Hermanos Jota');
    console.log(`  🏷️  Categorías creadas:   ${categoriasInsertadas.length}`);
    console.log(`  📦 Productos vinculados:   ${insertados.length}`);
    Object.entries(porCategoria).forEach(([categoria, total]) => {
      console.log(`     • ${categoria}: ${total}`);
    });
    console.log('='.repeat(65) + '\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n' + '!'.repeat(65));
    console.error('  ❌ ERROR durante el seed de la base de datos');
    console.error(`  ⚠️  Detalle: ${error.message}`);
    console.error('!'.repeat(65) + '\n');
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

sembrarDB();
