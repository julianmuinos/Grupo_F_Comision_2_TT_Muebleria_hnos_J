# E-commerce Mueblería Hermanos Jota 🪵
## Trabajo Práctico Integrador — Sprints 3, 4, 5, 6, 7 y 8 | ITBA (Comisión 2 TT · Grupo F)

Repositorio oficial del equipo para el desarrollo de la plataforma e-commerce de **Mueblería Hermanos Jota**, basada en una arquitectura Cliente-Servidor desacoplada con **Node.js + Express**, **MongoDB Atlas (Mongoose)**, **Autenticación JWT** y **Gestión de Pedidos** en el backend, y **React 19 + Vite + Axios + Context API** en el frontend, desplegada en **Render** y **Vercel**.

---

## 👥 Integrantes del Equipo

* **Alexis Fernando Rojas**
* **Emanuel Ramirez**
* **Franco Blanchard**
* **Julian Muiños**
* **Santino Marchesini**

🔗 **Repositorio Sprint 1 y 2 (Vanilla Web Architecture)**: [https://github.com/emanuelrz/Grupo_7_Comision_2_TT_Muebleria_hnos_J](https://github.com/emanuelrz/Grupo_7_Comision_2_TT_Muebleria_hnos_J)

---

## 🌿 Identidad y Manual de Marca

La propuesta estética se inspira en el diseño modernista de los años 60 (*Mid-Century Modern*), la ebanistería tradicional argentina y el compromiso con la sostenibilidad mediante maderas nativas certificadas FSC®.

### Paleta Cromática Oficial
* **Siena Tostado (`#823b18`)**: Color primario de marca que evoca la calidez de la madera noble (nogal, petiribí) y la solidez artesanal. Utilizado en acentos principales, botones primarios y badges destacados con tipografía en blanco.
* **Verde Salvia (`#486730`)**: Color secundario representativo de la naturaleza, la sostenibilidad y la regeneración de bosques nativos.
* **Alabastro (`#fff8f3`)**: Fondo orgánico luminoso que aporta claridad editorial, sofisticación y pureza visual.
* **Carbón Artesanal (`#221610`)**: Contraste tipográfico de alta legibilidad y jerarquía visual.

---

## 🏛️ Arquitectura del Sistema

La solución adopta una **arquitectura desacoplada en capas (Client-Server con Base de Datos en la Nube, Autenticación JWT y Persistencia de Pedidos)**:

```text
┌────────────────────────────────────────────────────────┐
│             CLIENTE (Frontend en Vercel)               │
│   React 19 + Vite + React Router 7 + Context + Axios   │
│      Despliegue: https://<tu-app>.vercel.app           │
├────────────────────────────────────────────────────────┤
│  • Enrutamiento SPA con soporte vercel.json (rewrites) │
│  • Contextos globales: AuthContext y CartContext       │
│  • Pantallas Auth (/login, /registro) y /perfil        │
│  • Checkout autenticado y vista /mis-pedidos           │
│  • Rutas protegidas con <ProtectedRoute>               │
│  • Navegación dinámica condicional en Navbar y Drawer  │
│  • Panel CRUD completo (/admin/crear-producto, PUT/DEL)│
│  • Interceptor Axios Bearer JWT + timeout 60s          │
└───────────────────────────┬────────────────────────────┘
                            │
                    Peticiones HTTP (REST API)
                    JSON Payloads + Authorization Bearer JWT
                    (CORS whitelist + CLIENT_URL)
                            │
┌───────────────────────────▼────────────────────────────┐
│             SERVIDOR (Backend API en Render)           │
│      Node.js + Express 4 + JWT + bcryptjs + Dotenv     │
│          Despliegue: https://<tu-api>.onrender.com     │
├────────────────────────────────────────────────────────┤
│  • Auth JWT: /api/auth/register, /login y /profile     │
│  • Pedidos protegidos: /api/orders (/api/pedidos)      │
│  • Catálogo CRUD: /api/productos (/products)           │
│  • Categorías: /api/categorias (/categories)           │
│  • Middlewares: authMiddleware, validaciones y errores │
└───────────────────────────┬────────────────────────────┘
                            │
                    Mongoose 9 ODM (Driver TLS/SSL)
                            │
┌───────────────────────────▼────────────────────────────┐
│              BASE DE DATOS (Cloud Database)            │
│          MongoDB Atlas (Cluster M0 / AWS)              │
│          Base de Datos: muebleria_hermanos_jota        │
├────────────────────────────────────────────────────────┤
│  • Colecciones: productos, categorias, users y orders  │
│  • Clave primaria nativa: _id (ObjectId)               │
│  • Relaciones ref/populate (Producto-Categoria-Order)  │
└────────────────────────────────────────────────────────┘
```

### Características del Backend
* **Autenticación y Seguridad con JWT + `bcryptjs`**: Registro, inicio de sesión y consulta de perfil autenticado en `/api/auth/register`, `/api/auth/login` y `GET /api/auth/profile` con contraseñas hasheadas en `models/User.js`, firma/verificación de tokens en `utils/jwt.js`, validaciones en `middlewares/authValidations.js` y guardia `middlewares/authMiddleware.js`. Ver especificación en [`backend/AUTH_API.md`](backend/AUTH_API.md).
* **Gestión Segura de Pedidos (`Order`)**: Modelo `models/Order.js` vinculado obligatoriamente a `User` (`ref: 'User'`) con snapshot inmutable de ítems (`producto`, `nombre`, `precio`, `cantidad`, `imagen`, `subtotal`), cálculo de totales y validación/descuento automático de stock exclusivamente en el servidor (`controllers/orders.controller.js`), evitando manipulación de precios desde el cliente.
* **Modelado Relacional Mongoose (`ref` y `populate`)**: Modelo `Categoria` (`models/Categoria.js`) relacionado con `Producto` (`models/Producto.js`) a través de `categoriaRef` (`ref: 'Categoria'`), y población de usuarios/productos en consultas de órdenes.
* **Conexión a MongoDB Atlas con Mongoose**: Módulo desacoplado en `config/db.js` con manejo de excepciones `try/catch`, validación estricta de `MONGO_URI` y consola decorada con host y base de datos.
* **Gestión de Entorno y Blueprint de Despliegue**: Variables críticas (`PORT`, `NODE_ENV`, `MONGO_URI`, `CLIENT_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`) gestionadas con `dotenv`, plantillas `.env.example` y archivo declarativo [`render.yaml`](render.yaml) para despliegue automatizado en Render.
* **CORS con Lista Blanca Multi-Origen**: Configurado en `backend/index.js` para habilitar orígenes locales en desarrollo y validar orígenes autorizados en `CLIENT_URL` (soportando múltiples dominios separados por coma) en producción (`NODE_ENV=production`), permitiendo `Authorization` y `Content-Type`.
* **Controladores Asíncronos con CRUD Completo y Validaciones**: Operaciones `obtenerProductos`, `obtenerProductoPorId`, `crearProducto`, `actualizarProducto` y `eliminarProducto` respaldadas por `middlewares/validaciones.js` (`validarCrearProducto`, `validarActualizarProducto`, `validarIdMongo`).
* **Soporte de Endpoints Bilingües**: Montaje simultáneo en `/api/productos` (`/api/products`), `/api/categorias` (`/api/categories`) y `/api/orders` (`/api/pedidos`).
* **Script de Sembrado Masivo (Seed)**: Script `seed.js` idempotente que inicializa las 4 categorías oficiales y las 11 piezas del catálogo en Atlas mediante `npm run seed`.

### Características del Frontend
* **Single Page Application (SPA)**: Desarrollada con React 19, React Router v7 y Vite, con configuración de reescritura en `client/vercel.json` para soportar navegación directa y recargas sin errores 404 en Vercel.
* **Gestión Global de Identidad y Carrito (`Context API`)**:
  * **`AuthContext` (`src/context/AuthContext.jsx`)**: Gestiona `user`, `token`, `loading`, `isAuthenticated`, `login()`, `register()` y `logout()` con persistencia en `localStorage` (`hnosj_token` y `hnosj_user`).
  * **`CartContext` (`src/context/CartContext.jsx`)**: Centraliza `items`, `totalItems`, `totalPrice` y las operaciones del carrito con persistencia en `localStorage` (`hnosj_cart`), conectando catálogo, detalle, barra de navegación y modal sin *prop drilling*.
* **Checkout Autenticado e Historial de Pedidos**:
  * **`CartModal.jsx`**: Verifica sesión antes de finalizar la compra; si el visitante no inició sesión, conserva el carrito y lo redirige a `/login`. Si está autenticado, envía `POST /api/orders` con Bearer JWT, vacía el carrito y redirige a `/mis-pedidos` con confirmación de la orden creada.
  * **`/mis-pedidos` (`MyOrdersView.jsx`)**: Vista protegida mediante `<ProtectedRoute>` que consume `GET /api/orders/my-orders` con soporte de `AbortController`, manejo de expiración de token (`401`), reintentos, estado vacío y detalle completo por pedido (código, fecha, estado, medio de pago, ítems y total).
* **Pantallas de Autenticación y Perfil Protegido**:
  * **`/registro` (`RegisterView.jsx`)**: Formulario controlado (`nombre`, `email`, `password`, `confirmPassword`) con validaciones en cliente, estado de carga, visualización de errores de la API (`409 Conflict`) y redirección automática al iniciar sesión.
  * **`/login` (`LoginView.jsx`)**: Formulario controlado (`email`, `password`), toggle de visibilidad de contraseña, manejo de credenciales inválidas (`401`), avisos contextuales de redirección y retorno a la ruta protegida de origen.
  * **`/perfil` (`ProfileView.jsx`)**: Vista protegida con `<ProtectedRoute>` que exhibe los datos del cliente autenticado (nombre, email, fecha de registro/estado), enlace directo a `/mis-pedidos` y cierre de sesión.
* **Navegación Dinámica Condicional (`Navbar.jsx` y `MobileSidebar.jsx`)**: Adapta la interfaz según `AuthContext` y `CartContext` (mostrando `Login`/`Registro` sin sesión, y saludo personalizado, `Mis Pedidos`, `Mi Perfil`, `+ Crear Producto` y `Salir` con sesión activa).
* **Panel CRUD de Productos**: Formulario controlado de alta en `/admin/crear-producto` (`ProductForm.jsx`) y modales integrados de edición (`PUT`) y baja (`DELETE`) en `ProductDetail.jsx`.
* **Cliente HTTP con Interceptor JWT (`apiClient`)**: Instancia Axios en `src/services/api.js` con `baseURL` dinámica (`VITE_API_URL`), `timeout: 60000ms` (para tolerar *cold starts* en Render) e interceptor de peticiones que adjunta automáticamente `Authorization: Bearer <token>`.
* **Custom Hook `useProducts` y Skeleton Loader**: Lógica asíncrona encapsulada en `src/hooks/useProducts.js` y tarjetas *skeleton* con efecto shimmer en `ProductList.jsx`.

---

## 📐 Estructura del Proyecto

```text
Grupo_F_Comision_2_TT_Sprint_3-4_Muebleria_hnos_J/
├── backend/
│   ├── config/
│   │   └── db.js                   # Conexión a MongoDB Atlas mediante Mongoose
│   ├── controllers/
│   │   ├── auth.controller.js      # Registro, login y perfil autenticado (JWT)
│   │   ├── orders.controller.js    # Creación y consulta segura de pedidos por usuario
│   │   └── productos.controller.js # Controladores CRUD de productos
│   ├── data/
│   │   └── productos.js            # Catálogo original de referencia y datos del seed
│   ├── middlewares/
│   │   ├── authMiddleware.js       # Validación de header Bearer JWT e inyección de req.user
│   │   ├── authValidations.js      # Validaciones de registro y login
│   │   ├── errorHandler.js         # Manejador 404 y middleware centralizado de errores
│   │   ├── logger.js               # Middleware global de auditoría con timestamp
│   │   └── validaciones.js         # Validaciones de productos y formato ObjectId
│   ├── models/
│   │   ├── Categoria.js            # Esquema y modelo de Categorías
│   │   ├── Order.js                # Esquema de Pedidos con snapshot de ítems y ref a User
│   │   ├── Producto.js             # Esquema de Productos con _id nativo y categoriaRef
│   │   └── User.js                 # Esquema de Usuario con hashing automático bcryptjs
│   ├── routes/
│   │   ├── auth.routes.js          # Rutas POST /register, POST /login y GET /profile
│   │   ├── categorias.routes.js    # Rutas GET /api/categorias y /api/categories
│   │   ├── orders.routes.js        # Rutas protegidas POST /, GET /my-orders y GET /:id
│   │   └── productos.routes.js     # Rutas GET, POST, PUT y DELETE de productos
│   ├── utils/
│   │   └── jwt.js                  # Helpers signToken y verifyToken
│   ├── AUTH_API.md                 # Documentación detallada de contratos de Auth
│   ├── index.js                    # Servidor Express con CORS whitelist, dotenv y rutas
│   ├── seed.js                     # Script de sembrado masivo e idempotente
│   ├── .env.example                # Plantilla de variables de entorno para backend
│   ├── package.json                # Dependencias (express, cors, mongoose, bcryptjs, jsonwebtoken)
│   └── package-lock.json
│
├── client/
│   ├── public/
│   │   ├── assets/images/          # Fotografías de autor y logotipo SVG oficial
│   │   ├── favicon.svg             # Isotipo vectorial de la marca
│   │   └── icons.svg               # Sprite de iconos SVG
│   ├── src/
│   │   ├── api/
│   │   │   ├── orders.js           # Servicios HTTP createOrder y getMyOrders con Bearer JWT
│   │   │   └── productos.js        # Capa de consumo CRUD del catálogo usando apiClient
│   │   ├── components/
│   │   │   ├── CartModal.jsx       # Drawer del carrito y flujo autenticado de Finalizar Compra
│   │   │   ├── ContactForm.jsx     # Formulario controlado 100% con useState y validación
│   │   │   ├── ContactView.jsx     # Vista de contacto y datos oficiales de Casa Taller
│   │   │   ├── Footer.jsx          # Pie institucional con certificación FSC® y origen
│   │   │   ├── HomeView.jsx        # Portada editorial con piezas destacadas y pilares
│   │   │   ├── LoginView.jsx       # Pantalla /login controlada conectada a AuthContext
│   │   │   ├── MobileSidebar.jsx   # Menú drawer mobile con UI condicional de sesión
│   │   │   ├── MyOrdersView.jsx    # Vista protegida /mis-pedidos con historial de compras
│   │   │   ├── Navbar.jsx          # Barra superior dinámica según AuthContext y CartContext
│   │   │   ├── ProductCard.jsx     # Tarjeta de producto con datos reales y precios ARS
│   │   │   ├── ProductDetail.jsx   # Ficha detallada con acciones CRUD (PUT y DELETE)
│   │   │   ├── ProductForm.jsx     # Alta de producto (/admin/crear-producto)
│   │   │   ├── ProductList.jsx     # Grilla interactiva, useProducts y skeleton loading
│   │   │   ├── ProfileView.jsx     # Vista protegida /perfil con datos del usuario y logout
│   │   │   ├── ProtectedRoute.jsx  # Guardia de rutas privadas con redirección a /login
│   │   │   ├── RegisterView.jsx    # Pantalla /registro controlada con validación y errores
│   │   │   └── ScrollToTop.jsx     # Reset automático de scroll al cambiar de ruta
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # Estado global de autenticación JWT y localStorage
│   │   │   └── CartContext.jsx     # Estado global del carrito (items, totalItems, totalPrice)
│   │   ├── hooks/
│   │   │   └── useProducts.js      # Custom hook reactivo (products, loading, error)
│   │   ├── services/
│   │   │   └── api.js              # Instancia Axios centralizada + interceptor Bearer JWT
│   │   ├── App.css                 # Estilos responsive, tokens de marca, Auth, Perfil y Pedidos
│   │   ├── App.jsx                 # Enrutamiento SPA, Providers y layout global
│   │   ├── index.css               # Reseteo base y configuración de Tailwind CSS
│   │   └── main.jsx                # Renderizado principal de la aplicación React 19
│   ├── index.html                  # Plantilla HTML5 con metadatos y fuentes
│   ├── vercel.json                 # Configuración de reescritura para rutas SPA en Vercel
│   ├── .env.example                # Plantilla de variable VITE_API_URL
│   ├── vite.config.js              # Configuración del bundler Vite
│   ├── eslint.config.js            # Reglas de linting y buenas prácticas de código
│   └── package.json                # Dependencias de React 19, Axios, Router, Tailwind CSS
│
├── .gitignore                      # Reglas de exclusión unificadas (node_modules, .env, builds)
├── .prettierignore                 # Exclusiones globales de formateo
├── .prettierrc                     # Reglas de formateo de código unificado
├── LICENSE                         # Licencia del repositorio
├── render.yaml                     # Blueprint declarativo para despliegue del backend en Render
└── README.md                       # Documentación integral del proyecto
```

---

## 🧭 Rutas del Frontend (SPA)

| Ruta | Acceso | Componente | Descripción |
| :--- | :--- | :--- | :--- |
| `/` | Público | `HomeView` | Portada principal con hero editorial y piezas destacadas. |
| `/productos` | Público | `ProductList` | Catálogo completo con buscador, filtros y skeleton loader. |
| `/productos/:id` | Público | `ProductDetail` | Detalle de producto con selector de cantidad y modales CRUD. |
| `/contacto` | Público | `ContactView` | Información del Showroom y formulario de contacto controlado. |
| `/login` | Público | `LoginView` | Inicio de sesión con manejo de errores y redirección post-login. |
| `/registro` | Público | `RegisterView` | Registro de nuevo cliente con validación de contraseñas y API. |
| `/perfil` | **Protegido** | `ProfileView` | Datos del cliente autenticado, enlace a pedidos y cierre de sesión. |
| `/mis-pedidos` | **Protegido** | `MyOrdersView` | Historial real de pedidos del cliente (`GET /api/orders/my-orders`). |
| `/admin/crear-producto` | Panel CRUD | `ProductForm` | Alta de nuevos muebles en MongoDB Atlas. |

---

## 🔌 Endpoints de la API REST

### Autenticación (`/api/auth`)
> Ver contratos detallados y uso de `authMiddleware` en [`backend/AUTH_API.md`](backend/AUTH_API.md).

| Método | Endpoint | Acceso | Descripción | Respuestas HTTP |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Público | Registra un nuevo usuario (`nombre`, `email`, `password`), hashea la clave con `bcryptjs` y emite JWT. | `201 Created`<br>`400 Datos inválidos`<br>`409 Email existente` |
| `POST` | `/api/auth/login` | Público | Valida credenciales (`email`, `password`) y retorna token JWT + datos públicos del usuario. | `200 OK`<br>`400 Datos inválidos`<br>`401 Credenciales inválidas` |
| `GET` | `/api/auth/profile` | **Privado (JWT)** | Devuelve los datos públicos del usuario autenticado inyectado en `req.user`. | `200 OK`<br>`401 No autorizado` |

### Pedidos Protegidos (`/api/orders` y alias `/api/pedidos`)
> Todos los endpoints de este módulo exigen el header `Authorization: Bearer <token>`.

| Método | Endpoint | Acceso | Descripción | Respuestas HTTP |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/orders`<br>`/api/pedidos` | **Privado (JWT)** | Crea un pedido asociado a `req.user`, validando stock, descontando inventario y calculando precios reales en servidor. | `201 Created`<br>`400 Carrito vacío / Sin stock`<br>`401 No autorizado`<br>`404 Producto inexistente` |
| `GET` | `/api/orders/my-orders`<br>`/api/pedidos/my-orders` | **Privado (JWT)** | Obtiene únicamente los pedidos del cliente autenticado ordenados del más reciente al más antiguo. | `200 OK`<br>`401 No autorizado` |
| `GET` | `/api/orders/:id`<br>`/api/pedidos/:id` | **Privado (JWT)** | Obtiene el detalle de un pedido propio verificando titularidad del usuario. | `200 OK`<br>`400 ID inválido`<br>`401 No autorizado`<br>`403 Prohibido`<br>`404 No encontrado` |

### Productos y Categorías

| Método | Endpoint | Parámetros Query / URL | Descripción | Respuestas HTTP |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | — | Comprobación de estado del servidor (*Health check*). | `200 OK` |
| `GET` | `/api/categorias`<br>`/api/categories` | — | Obtiene las categorías oficiales ordenadas alfabéticamente. | `200 OK`<br>`500 Error interno` |
| `GET` | `/api/productos`<br>`/api/products` | `?categoria=asientos`<br>`?destacados=true` | Obtiene el catálogo completo desde MongoDB Atlas (con soporte de filtros opcionales). | `200 OK`<br>`500 Error interno` |
| `GET` | `/api/productos/:id`<br>`/api/products/:id` | `:id` (`ObjectId` hexadecimal de 24 caracteres) | Obtiene el detalle técnico y especificaciones de un mueble según su `_id` de MongoDB. | `200 OK`<br>`400 ID inválido`<br>`404 No encontrado`<br>`500 Error interno` |
| `POST` | `/api/productos`<br>`/api/products` | Body JSON con campos del producto | Da de alta un nuevo producto en MongoDB con validación de campos obligatorios y normalización bilingüe. | `201 Created`<br>`400 Datos inválidos`<br>`500 Error interno` |
| `PUT` | `/api/productos/:id`<br>`/api/products/:id` | `:id` (`ObjectId`), Body JSON | Modifica la información de un producto existente en la base de datos aplicando validaciones. | `200 OK`<br>`400 ID/Datos inválidos`<br>`404 No encontrado`<br>`500 Error interno` |
| `DELETE` | `/api/productos/:id`<br>`/api/products/:id` | `:id` (`ObjectId` hexadecimal) | Elimina un producto de la colección en MongoDB Atlas por su identificador. | `200 OK`<br>`400 ID inválido`<br>`404 No encontrado`<br>`500 Error interno` |

### Formato de Respuestas de la API

* **Respuesta Exitosa (Registro / Login - `/api/auth`)**:
  ```json
  {
    "success": true,
    "message": "Inicio de sesión exitoso.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "673f1a2b3c4d5e6f7a8b9c0d",
      "nombre": "María Gómez",
      "email": "maria@ejemplo.com"
    }
  }
  ```

* **Respuesta Exitosa (Creación de Pedido - `POST /api/orders` 201 Created)**:
  ```json
  {
    "success": true,
    "message": "Pedido generado exitosamente.",
    "data": {
      "_id": "6744c8e12a9f4b0012ab34cd",
      "user": {
        "_id": "673f1a2b3c4d5e6f7a8b9c0d",
        "nombre": "María Gómez",
        "email": "maria@ejemplo.com"
      },
      "items": [
        {
          "producto": "6ae36d4873c5d20d44300500",
          "nombre": "Aparador Uspallata",
          "precio": 2350000,
          "cantidad": 1,
          "imagen": "/assets/images/aparador-uspallata.png",
          "subtotal": 2350000
        }
      ],
      "total": 2350000,
      "estado": "pendiente",
      "metodoPago": "transferencia",
      "createdAt": "2026-11-24T21:15:00.000Z"
    }
  }
  ```

* **Respuesta Exitosa (Catálogo General - MongoDB)**:
  ```json
  {
    "success": true,
    "total": 11,
    "data": [
      {
        "_id": "6ae36d4873c5d20d44300500",
        "nombre": "Aparador Uspallata",
        "categoria": "almacenaje",
        "precio": 2350000,
        "descripcion": "Aparador de seis puertas en nogal sostenible...",
        "imagen": "/assets/images/aparador-uspallata.png",
        "stock": 8,
        "destacado": true
      }
    ]
  }
  ```

* **Respuestas de Error Estandarizadas**:
  * **400 Bad Request (Validación de campos, stock insuficiente u ObjectId malformado)**:
    ```json
    {
      "success": false,
      "status": 400,
      "message": "Errores de validación en la solicitud.",
      "errores": [
        "El nombre del producto es obligatorio.",
        "El precio debe ser un número mayor o igual a 0."
      ]
    }
    ```
  * **401 Unauthorized / 403 Forbidden / 409 Conflict (Seguridad y Autenticación)**:
    ```json
    {
      "success": false,
      "status": 401,
      "message": "Acceso no autorizado. Token no proporcionado."
    }
    ```
  * **404 Not Found (Recurso no encontrado)**:
    ```json
    {
      "success": false,
      "status": 404,
      "message": "Producto con ID 672001a5b6c7d8e9f0123456 no encontrado en el catálogo."
    }
    ```

---

## 🛠️ Instalación y Ejecución Local

### Prerrequisitos
* **Node.js**: v18.0.0 o superior (recomendado v20+)
* **npm**: v9.0.0 o superior
* **Clúster en MongoDB Atlas**: con acceso de red configurado (`0.0.0.0/0` para desarrollo grupal) y usuario con privilegios de lectura/escritura.

---

### 1. Configuración del Servidor Backend (Express + MongoDB Atlas)
Abrir una terminal en la raíz del repositorio:
```bash
cd backend
npm install
```

Crear el archivo `.env` dentro de `backend/` a partir de [`backend/.env.example`](backend/.env.example):
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/muebleria_hermanos_jota?retryWrites=true&w=majority
JWT_SECRET=<clave_secreta_larga_y_segura>
JWT_EXPIRES_IN=7d
```
> ⚠️ **Importante:** `JWT_SECRET` es obligatoria tanto en tu `.env` local como en las **Environment Variables** de Render para firmar y verificar tokens en `/api/auth/*` y `/api/orders/*`.

**Sembrar la base de datos (Primera vez):**
Para inicializar la base de datos en Atlas con las categorías y las 11 piezas oficiales:
```bash
npm run seed
```

**Iniciar el servidor:**
```bash
# Modo producción
npm start

# Modo desarrollo (con hot-reload nativo)
npm run dev
```
> El servidor iniciará en `http://localhost:5000` confirmando la conexión decorada con MongoDB Atlas en la consola.

---

### 2. Configuración de la Aplicación Cliente (React + Vite)
En una segunda terminal desde la raíz del proyecto:
```bash
cd client
npm install
```

Crear el archivo `.env` dentro de `client/` a partir de [`client/.env.example`](client/.env.example):
```env
VITE_API_URL=http://localhost:5000/api
```

**Iniciar el cliente de desarrollo:**
```bash
npm run dev
```
> La aplicación se abrirá en `http://localhost:5173` consumiendo la API de Express y MongoDB Atlas a través de Axios.

---

### Scripts Disponibles en el Frontend
* `npm run dev`: Inicia el servidor de desarrollo Vite con Hot Module Replacement (HMR).
* `npm run build`: Genera el bundle optimizado para producción en `client/dist`.
* `npm run preview`: Previsualiza localmente la compilación de producción.
* `npm run lint`: Ejecuta ESLint sobre todo el código fuente de React.
* `npm run lint:fix`: Corrige automáticamente inconsistencias de linting detectables.
* `npm run format`: Formatea el código con Prettier según las reglas unificadas del proyecto.

---

## ☁️ Despliegue en Producción (Render + Vercel)

* **Backend en Render ([`render.yaml`](render.yaml))**:
  * `Root Directory`: `backend` · `Build Command`: `npm install` · `Start Command`: `npm start`.
  * Variables requeridas: `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN=7d` y `CLIENT_URL` apuntando al dominio público de Vercel (sin barra final; soporta múltiples orígenes separados por coma).
* **Frontend en Vercel ([`client/vercel.json`](client/vercel.json))**:
  * `Root Directory`: `client` · `Framework Preset`: `Vite` · `Output Directory`: `dist`.
  * Variable requerida: `VITE_API_URL=https://<tu-servicio>.onrender.com/api`.

---

## 🔍 Registro de Mejoras y Calidad de Código (Sprints 4 al 8)

1. **Unificación y Optimización de `.gitignore` y `.prettierignore`**: Consolidación en la raíz con reglas `.env.*` exhaustivas, exclusión de cachés (`.vite/`, `.eslintcache`, `.vercel/`) y cobertura (`coverage/`).
2. **Persistencia NoSQL en la Nube**: Migración de catálogo estático en memoria a MongoDB Atlas mediante Mongoose 9 e identificadores nativos `_id` (`ObjectId`).
3. **Modelado Relacional (`Categoria`, `Producto`, `User`, `Order`)**: Relaciones con `ref` y `populate` tanto para líneas de catálogo como para órdenes asociadas a usuarios autenticados.
4. **CRUD Completo de Catálogo (Backend y Frontend)**: Endpoints `POST`, `PUT` y `DELETE` con validaciones (`validaciones.js`), formulario `ProductForm.jsx` (`/admin/crear-producto`) y modales de edición/baja en `ProductDetail.jsx`.
5. **Sistema de Autenticación JWT**: Modelo `User` con hashing `bcryptjs`, helpers `utils/jwt.js`, `authMiddleware.js` y endpoints `/api/auth/register`, `/api/auth/login` y `GET /api/auth/profile`.
6. **Checkout Protegido y Cálculo Server-Side de Pedidos**: Endpoints `POST /api/orders`, `GET /api/orders/my-orders` y `GET /api/orders/:id` que consultan precios reales en MongoDB, validan/descuentan stock e impiden adulteración de montos desde el cliente.
7. **Contextos Globales, Interceptor JWT y Guardia de Rutas**: `AuthContext.jsx`, `CartContext.jsx`, interceptor de solicitudes en `src/services/api.js` (`Authorization: Bearer <token>`) y componente `<ProtectedRoute>`.
8. **Pantallas de Identidad, Historial y UI Condicional**: Vistas `/login` (`LoginView.jsx`), `/registro` (`RegisterView.jsx`), `/perfil` (`ProfileView.jsx`), `/mis-pedidos` (`MyOrdersView.jsx`), flujo autenticado en `CartModal.jsx` y barra de navegación condicional en `Navbar.jsx` y `MobileSidebar.jsx`.
9. **Resiliencia de Red y Experiencia de Carga**: `useProducts` con `AbortController`, *Skeleton Loader* con shimmer en catálogo y `timeout: 60000ms` en Axios para tolerar *cold starts* de Render.
10. **Infraestructura Declarativa de Despliegue**: Incorporación de `client/vercel.json` (rewrites SPA) y `render.yaml` (blueprint de servicio web y variables de entorno).

---

## 📍 Casa Taller Oficial

* **Ubicación**: Av. San Juan 2847, C1232AAB — Barrio de San Cristóbal, Ciudad Autónoma de Buenos Aires, Argentina.
* **Horarios de Atención**: Lunes a Viernes de 10:00 a 19:00 hs · Sábados de 10:00 a 14:00 hs.
* **WhatsApp y Consultas**: `+54 11 4567-8900`
* **Correo Electrónico**: `info@hermanosjota.com.ar`
* **Instagram Oficial**: [`@hermanosjota_ba`](https://instagram.com/hermanosjota_ba)
