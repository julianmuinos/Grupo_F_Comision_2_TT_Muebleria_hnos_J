const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const conectarDB = require('./config/db');
const logger = require('./middlewares/logger');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Configuración de CORS segura para Desarrollo y Producción:
// Permite origen local en desarrollo (localhost:5173 / localhost:3000 / localhost:5000)
// y orígenes autorizados definidos en process.env.CLIENT_URL (e.g. Vercel) en producción.
const whitelist = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://localhost:5000',
];

if (process.env.CLIENT_URL) {
  // Soporta un único origen o múltiples orígenes separados por coma
  process.env.CLIENT_URL.split(',').forEach((url) => {
    const trimmed = url.trim();
    if (trimmed && !whitelist.includes(trimmed)) {
      whitelist.push(trimmed);
    }
  });
}

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir peticiones sin origin (como apps móviles, Postman o curl)
    if (!origin) return callback(null, true);

    // En desarrollo estricto sin CLIENT_URL o si el origen está en la lista blanca
    if (
      process.env.NODE_ENV !== 'production' ||
      whitelist.indexOf(origin) !== -1 ||
      whitelist.includes('*')
    ) {
      return callback(null, true);
    }

    return callback(
      new Error(`CORS bloqueado: el origen '${origin}' no está autorizado.`)
    );
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Middlewares globales de parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware global de logging
app.use(logger);

// Endpoint base / health check
app.get('/', (req, res) => {
  res.json({
    mensaje: 'Servidor base activo - Mueblería Hermanos Jota (Sprint 5 y 6)',
    estado: 'online',
    baseDeDatos: 'MongoDB Atlas',
    entorno: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Rutas de la API
const productosRouter = require('./routes/productos.routes');
const categoriasRouter = require('./routes/categorias.routes');
const authRouter = require('./routes/auth.routes');
const ordersRouter = require('./routes/orders.routes');

// Endpoints de catálogo y categorías
app.use('/api/productos', productosRouter);
app.use('/api/products', productosRouter);
app.use('/api/categorias', categoriasRouter);
app.use('/api/categories', categoriasRouter);

// Endpoints de Autenticación y Pedidos Protegidos (Sprint 6 - Emanuel Ramirez & Alexis)
app.use('/api/auth', authRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/pedidos', ordersRouter); // Alias en español

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
        console.log(
          `🚀 Servidor activo en el puerto ${PORT} (http://localhost:${PORT})`
        );
      });
    })
    .catch((err) => {
      console.error('Error al inicializar la aplicación:', err);
    });
}

module.exports = app;
