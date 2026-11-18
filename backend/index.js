const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const conectarDB = require('./config/db');
const logger = require('./middlewares/logger');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Configuración de CORS:
// Solo acepta peticiones desde el origen definido en CLIENT_URL;
// si no está definida, acepta todas las peticiones por defecto en modo desarrollo.
const corsOptions = {
  origin: process.env.CLIENT_URL || '*',
};
app.use(cors(corsOptions));

// Middlewares globales de parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware global de logging
app.use(logger);

// Endpoint base
app.get('/', (req, res) => {
  res.json({
    mensaje: 'Servidor base activo - Mueblería Hermanos Jota (Sprint 5 y 6)',
    estado: 'online',
    baseDeDatos: 'MongoDB Atlas'
  });
});

// Rutas de la API (soporta endpoint oficial y alias en inglés)
const productosRouter = require('./routes/productos.routes');
const categoriasRouter = require('./routes/categorias.routes');

app.use('/api/productos', productosRouter);
app.use('/api/products', productosRouter);
app.use('/api/categorias', categoriasRouter);
app.use('/api/categories', categoriasRouter);

// Middleware para manejo de rutas no encontradas (404)
app.use(notFoundHandler);

// Middleware centralizado de errores
app.use(errorHandler);

// Inicio del servidor solo en ejecución directa (evita colisiones de puerto al importar en tests)
if (require.main === module) {
  // Conexión a MongoDB antes de levantar el servidor Express
  conectarDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`🚀 Servidor base iniciado en http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Error al inicializar la aplicación:', err);
    });
}

module.exports = app;
