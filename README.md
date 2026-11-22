# E-commerce Mueblería Hermanos Jota 🪵
## Trabajo Práctico Integrador — Sprints 3, 4, 5, 6, 7 y 8 | ITBA (Comisión 2 TT · Grupo F)

Repositorio oficial del equipo para el desarrollo de la plataforma e-commerce de **Mueblería Hermanos Jota**, basada en una arquitectura Cliente-Servidor desacoplada con **Node.js + Express**, **MongoDB Atlas (Mongoose)** y **Autenticación JWT** en el backend, y **React 19 + Vite + Axios + Context API** en el frontend, desplegada en **Render** y **Vercel**.

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

La solución adopta una **arquitectura desacoplada en capas (Client-Server con Base de Datos en la Nube y Autenticación JWT)**:

```text
┌────────────────────────────────────────────────────────┐
│             CLIENTE (Frontend en Vercel)               │
│   React 19 + Vite + React Router 7 + Context + Axios   │
│      Despliegue: https://<tu-app>.vercel.app           │
├────────────────────────────────────────────────────────┤
│  • Enrutamiento SPA con soporte vercel.json (rewrites) │
│  • Contextos globales: AuthContext y CartContext       │
│  • Pantallas Auth (/login, /registro) y /perfil        │
│  • Rutas protegidas con <ProtectedRoute>               │
│  • Navegación dinámica condicional en Navbar y Drawer  │
│  • Panel CRUD completo (/admin/crear-producto, PUT/DEL)│
│  • Custom Hook useProducts con AbortController         │
│  • Instancia Axios apiClient (timeout 60s + Bearer JWT)│
└───────────────────────────┬────────────────────────────┘
                            │
                    Peticiones HTTP (REST API)
                    JSON Payloads + Authorization Bearer JWT
                    (CORS configurado por CLIENT_URL)
                            │
┌───────────────────────────▼────────────────────────────┐
│             SERVIDOR (Backend API en Render)           │
│      Node.js + Express 4 + JWT + bcryptjs + Dotenv     │
│          Despliegue: https://<tu-api>.onrender.com     │
├────────────────────────────────────────────────────────┤
│  • Auth JWT: /api/auth/register y /api/auth/login      │
│  • Controladores desacoplados (CRUD completo - MVC)    │
│  • Routers: /api/productos (/products) y /api/categorias│
│  • Middlewares: authMiddleware, validaciones y errores │
│  • Conexión modular asíncrona a base de datos          │
└───────────────────────────┬────────────────────────────┘
                            │
                    Mongoose 9 ODM (Driver TLS/SSL)
                            │
┌───────────────────────────▼────────────────────────────┐
│              BASE DE DATOS (Cloud Database)            │
│          MongoDB Atlas (Cluster M0 / AWS)              │
│          Base de Datos: muebleria_hermanos_jota        │
├────────────────────────────────────────────────────────┤
│  • Colecciones: productos, categorias y users          │
│  • Clave primaria nativa: _id (ObjectId)               │
│  • Relación ref/populate entre Producto y Categoria    │
└────────────────────────────────────────────────────────┘
```

### Características del Backend
* **Autenticación y Seguridad con JWT + `bcryptjs`**: Registro e inicio de sesión en `/api/auth/register` y `/api/auth/login` con contraseñas hasheadas en `models/User.js`, firma y verificación de tokens en `utils/jwt.js`, validaciones en `middlewares/authValidations.js` y middleware de protección `middlewares/authMiddleware.js`. Ver especificación completa en [`backend/AUTH_API.md`](backend/AUTH_API.md).
* **Modelado Relacional Mongoose (`ref` y `populate`)**: Modelo `Categoria` (`models/Categoria.js`) relacionado con `Producto` (`models/Producto.js`) a través de `categoriaRef` (`ref: 'Categoria'`), con población automática en lecturas y retrocompatibilidad total con el cliente.
* **Conexión a MongoDB Atlas con Mongoose**: Módulo desacoplado en `config/db.js` con manejo de excepciones `try/catch`, validación estricta de `MONGO_URI` y consola decorada con host y base de datos.
* **Gestión de Entorno con Dotenv**: Centralización de variables críticas (`PORT`, `MONGO_URI`, `CLIENT_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`) mediante `.env`, con plantillas seguras `.env.example` versionadas en el repositorio.
* **CORS Dinámico**: Configurado en `backend/index.js` para restringir accesos al origen `CLIENT_URL` en producción (o permitir todos los orígenes en desarrollo si no está definido).
* **Controladores Asíncronos con CRUD Completo (MVC)**: Implementación de operaciones de consulta (`obtenerProductos`, `obtenerProductoPorId`) y mutaciones (`crearProducto`, `actualizarProducto`, `eliminarProducto`) contra MongoDB Atlas.
* **Capa de Validaciones Robustas (`middlewares/validaciones.js`)**: Middlewares dedicados para validar campos obligatorios y coherencia numérica en creación (`validarCrearProducto`), actualización parcial (`validarActualizarProducto`) y validación estricta de formato `ObjectId` (`validarIdMongo`), retornando `400 Bad Request` ante entradas inválidas.
* **Soporte de Endpoints Bilingües**: Montaje simultáneo en `/api/productos` (`/api/products`) y `/api/categorias` (`/api/categories`) para interoperabilidad con clientes en inglés o español.
* **Script de Sembrado Masivo (Seed)**: Script ejecutable `seed.js` idempotente que inicializa categorías y carga los 11 muebles del catálogo oficial en Atlas con `npm run seed`.

### Características del Frontend
* **Single Page Application (SPA)**: Desarrollada con React 19, React Router v7 y Vite para una navegación fluida e instantánea, con configuración de reescritura en `client/vercel.json` para soportar navegación directa y recargas de página sin errores 404 en producción.
* **Gestión Global de Identidad y Carrito (`Context API`)**:
  * **`AuthContext` (`src/context/AuthContext.jsx`)**: Gestiona `user`, `token`, `loading`, `isAuthenticated`, `login()`, `register()` y `logout()`, con persistencia en `localStorage` (`hnosj_token` y `hnosj_user`) e inyección automática de `Authorization: Bearer <token>` en `apiClient`.
  * **`CartContext` (`src/context/CartContext.jsx`)**: Centraliza el carrito, `cartCount`, `cartTotal` y operaciones de stock/cantidad con persistencia en `localStorage` (`hnosj_cart`).
* **Pantallas de Autenticación y Perfil Protegido**:
  * **`/registro` (`RegisterView.jsx`)**: Formulario 100% controlado (`nombre`, `email`, `password`, `confirmPassword`) con validaciones en cliente, estado de carga, visualización de errores del servidor (ej. `409 Conflict` por correo ya registrado) y redirección automática al iniciar sesión.
  * **`/login` (`LoginView.jsx`)**: Formulario controlado (`email`, `password`), toggle de visibilidad de contraseña, manejo de credenciales inválidas (`401`), estado de carga y redirección inteligente post-login (a Inicio `/` o a la ruta protegida de origen).
  * **`/perfil` (`ProfileView.jsx`)**: Vista accesible únicamente a través de **`<ProtectedRoute>`** que muestra datos del cliente autenticado (nombre, email, fecha de registro/estado), enlace directo a `/mis-pedidos` y botón de cierre de sesión.
* **Navegación Dinámica Condicional (`Navbar.jsx` y `MobileSidebar.jsx`)**: Consume `AuthContext` y `CartContext` para adaptar el header y menú móvil según el estado de sesión:
  * *Sin sesión*: muestra **Login** (`/login`) y **Registro** (`/registro`), ocultando rutas internas.
  * *Con sesión*: oculta Login/Registro y habilita saludo personalizado (`Hola, {nombre}`), **Mis Pedidos** (`/mis-pedidos`), **Mi Perfil** (`/perfil`), **+ Crear Producto** (`/admin/crear-producto`) y botón **Salir / Cerrar Sesión**.
* **Panel CRUD de Productos**: Formulario controlado de alta en `/admin/crear-producto` (`ProductForm.jsx`) con redirección programática vía `useNavigate`, más modales integrados de edición (`PUT`) y eliminación (`DELETE`) en `ProductDetail.jsx`.
* **Cliente HTTP con Axios (`apiClient`)**: Instancia centralizada en `src/services/api.js` configurada con `baseURL` dinámica desde `VITE_API_URL`, `timeout: 60000ms` (60 segundos para tolerar arranques en frío de Render) y headers JSON por defecto.
* **Custom Hook `useProducts` y Skeleton Loader**: Encapsula en `src/hooks/useProducts.js` la lógica asíncrona con `AbortController` y renderiza tarjetas *skeleton* con animación shimmer en `ProductList.jsx` durante la carga.

---

## 📐 Estructura del Proyecto

```text
Grupo_F_Comision_2_TT_Sprint_3-4_Muebleria_hnos_J/
├── backend/
│   ├── config/
│   │   └── db.js                   # Conexión a MongoDB Atlas mediante Mongoose
│   ├── controllers/
│   │   ├── auth.controller.js      # Controladores de registro y login con JWT
│   │   └── productos.controller.js # Controladores CRUD de productos
│   ├── data/
│   │   └── productos.js            # Catálogo original de referencia y datos del seed
│   ├── middlewares/
│   │   ├── authMiddleware.js       # Validación de header Bearer JWT e inyección de req.user
│   │   ├── authValidations.js      # Validaciones de registro y login
│   │   ├── errorHandler.js         # Manejador 404 y middleware centralizado de errores
│   │   ├── logger.js               # Middleware global de auditoría con timestamp
│   │   └── validaciones.js         # Validaciones de body y formato ObjectId
│   ├── models/
│   │   ├── Categoria.js            # Esquema y modelo de Categorías
│   │   ├── Producto.js             # Esquema y modelo Mongoose con _id nativo y categoriaRef
│   │   └── User.js                 # Esquema de Usuario con hashing automático bcryptjs
│   ├── routes/
│   │   ├── auth.routes.js          # Rutas POST /api/auth/register y /api/auth/login
│   │   ├── categorias.routes.js    # Rutas GET /api/categorias y /api/categories
│   │   └── productos.routes.js     # Rutas GET, POST, PUT y DELETE de productos
│   ├── utils/
│   │   └── jwt.js                  # Helpers signToken y verifyToken (sin secretos hardcodeados)
│   ├── AUTH_API.md                 # Documentación detallada de contratos de Auth
│   ├── index.js                    # Servidor Express con CORS, dotenv y rutas
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
│   │   │   └── productos.js        # Capa de consumo CRUD del catálogo usando apiClient
│   │   ├── components/
│   │   │   ├── CartModal.jsx       # Drawer del carrito/cotizador con cálculo de envío
│   │   │   ├── ContactForm.jsx     # Formulario controlado 100% con useState y validación
│   │   │   ├── ContactView.jsx     # Vista de contacto y datos oficiales de Casa Taller
│   │   │   ├── Footer.jsx          # Pie institucional con certificación FSC® y origen
│   │   │   ├── HomeView.jsx        # Portada editorial con piezas destacadas y pilares
│   │   │   ├── LoginView.jsx       # Pantalla /login controlada conectada a AuthContext
│   │   │   ├── MobileSidebar.jsx   # Menú drawer mobile con UI condicional de sesión
│   │   │   ├── Navbar.jsx          # Barra superior dinámica según estado de autenticación
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
│   │   │   └── CartContext.jsx     # Estado global del carrito de compras
│   │   ├── hooks/
│   │   │   └── useProducts.js      # Custom hook reactivo (products, loading, error)
│   │   ├── services/
│   │   │   └── api.js              # Instancia centralizada de Axios (apiClient, timeout 60s)
│   │   ├── App.css                 # Estilos responsive, tokens de marca y vistas Auth/Perfil
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
├── .gitignore                      # Reglas de exclusión unificadas (node_modules, .env, dist)
├── .prettierignore                 # Exclusiones globales de formateo
├── .prettierrc                     # Reglas de formateo de código unificado
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
| `/mis-pedidos` | **Protegido** | Vista protegida | Historial de pedidos del cliente autenticado. |
| `/admin/crear-producto` | Panel CRUD | `ProductForm` | Alta de nuevos muebles en MongoDB Atlas. |

---

## 🔌 Endpoints de la API REST

### Autenticación (`/api/auth`)
> Ver contratos completos, ejemplos de payload y uso de `authMiddleware` en [`backend/AUTH_API.md`](backend/AUTH_API.md).

| Método | Endpoint | Acceso | Descripción | Respuestas HTTP |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Público | Registra un nuevo usuario (`nombre`, `email`, `password`), hashea la clave con `bcryptjs` y emite JWT. | `201 Created`<br>`400 Datos inválidos`<br>`409 Email existente` |
| `POST` | `/api/auth/login` | Público | Valida credenciales (`email`, `password`) y retorna token JWT + datos públicos del usuario. | `200 OK`<br>`400 Datos inválidos`<br>`401 Credenciales inválidas` |

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

* **Respuesta Exitosa (Detalle por `_id`)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "6ae36d4873c5d20d44300500",
      "nombre": "Aparador Uspallata",
      "categoria": "almacenaje",
      "precio": 2350000,
      "medidas": "180 × 45 × 75 cm",
      "materiales": "Nogal macizo FSC®, herrajes de latón",
      "destacado": true,
      "specs": {
        "acabado": "Aceite natural ecológico",
        "peso": "68 kg",
        "capacidad": "6 compartimentos interiores"
      }
    }
  }
  ```

* **Respuesta Exitosa (Alta de Producto - POST 201 Created)**:
  ```json
  {
    "success": true,
    "message": "Producto creado exitosamente en la base de datos.",
    "data": {
      "_id": "672412ef89a0b123456789ab",
      "nombre": "Mesa de Centro Bariloche",
      "categoria": "mesas",
      "precio": 980000,
      "descripcion": "Mesa baja en roble macizo con acabado ecológico.",
      "imagen": "/assets/images/mesa-bariloche.png",
      "stock": 4,
      "inStock": true,
      "destacado": false,
      "createdAt": "2026-10-31T14:00:00.000Z",
      "updatedAt": "2026-10-31T14:00:00.000Z"
    }
  }
  ```

* **Respuesta Exitosa (Baja de Producto - DELETE 200 OK)**:
  ```json
  {
    "success": true,
    "message": "Producto eliminado exitosamente de la base de datos.",
    "data": {
      "_id": "672412ef89a0b123456789ab",
      "nombre": "Mesa de Centro Bariloche"
    }
  }
  ```

* **Respuestas de Error Estandarizadas**:
  * **400 Bad Request (ObjectId malformado)**:
    ```json
    {
      "success": false,
      "status": 400,
      "message": "El parámetro \"id\" ('id-invalido-123') no es un identificador válido de MongoDB (ObjectId)."
    }
    ```
  * **400 Bad Request (Validación de campos obligatorios o coherencia)**:
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
  * **401 Unauthorized / 409 Conflict (Autenticación)**:
    ```json
    {
      "success": false,
      "status": 401,
      "message": "Credenciales inválidas. Verificá tu email y contraseña."
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
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/muebleria_hermanos_jota?retryWrites=true&w=majority
JWT_SECRET=<clave_secreta_larga_y_segura>
JWT_EXPIRES_IN=7d
```
> ⚠️ **Importante:** `JWT_SECRET` es obligatoria tanto en tu `.env` local como en las **Environment Variables** de Render para poder firmar y verificar tokens en `/api/auth/register` y `/api/auth/login`.

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

Crear el archivo `.env` dentro de `client/`:
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

## 🔍 Registro de Mejoras y Calidad de Código (Sprints 4 al 8)

1. **Unificación y Optimización de `.gitignore` y `.prettierignore`**: Consolidación en la raíz con reglas `.env.*` exhaustivas, exclusión de cachés (`.eslintcache`) y cobertura de testing (`coverage/`).
2. **Persistencia NoSQL en la Nube**: Migración exitosa de catálogo estático en memoria a base de datos distribuida en MongoDB Atlas mediante Mongoose 9.
3. **Modelado Relacional (`Categoria` y `Producto`)**: Incorporación de `models/Categoria.js` y referencia `categoriaRef` con población automática y rutas `/api/categorias`.
4. **Identificadores Nativos de MongoDB**: Adopción de `_id` (`ObjectId`) como clave primaria técnica única, resolviendo ambigüedades e inconsistencias de auto-incrementos manuales.
5. **CRUD Completo (Backend y Frontend)**: Implementación de `POST /api/productos`, `PUT /api/productos/:id` y `DELETE /api/productos/:id` junto a `ProductForm.jsx` (`/admin/crear-producto`) y modales de edición/borrado en `ProductDetail.jsx`.
6. **Capa Centralizada de Validaciones (`validaciones.js`)**: Verificación de presencia, tipos y coherencia de datos previa a la persistencia con respuestas `400 Bad Request`.
7. **Resiliencia de Conexión y Cold Start**: El servidor Express condiciona el inicio del listener HTTP a la confirmación previa del handshake con MongoDB Atlas, y el cliente Axios utiliza `timeout: 60000ms` (60s) en `src/services/api.js` para tolerar arranques en frío del plan gratuito de Render.
8. **Sistema de Autenticación JWT en Backend**: Modelo `User` con hashing `bcryptjs`, helpers `utils/jwt.js`, validaciones en `authValidations.js`, middleware `authMiddleware.js` y endpoints `/api/auth/register` y `/api/auth/login`.
9. **Contextos Globales y Rutas Protegidas**: Implementación de `AuthContext.jsx` (persistencia de sesión y header Bearer), `CartContext.jsx` y guardia `<ProtectedRoute>` en el cliente.
10. **Pantallas de Identidad y UI Condicional**: Construcción de `/login` (`LoginView.jsx`), `/registro` (`RegisterView.jsx`), `/perfil` (`ProfileView.jsx`) y navegación dinámica condicional en `Navbar.jsx` y `MobileSidebar.jsx`.
11. **Custom Hook Reactivo (`useProducts`) y Skeleton Loader**: Desacoplamiento de la lógica de red con `AbortController` y esqueletos con efecto shimmer en la grilla del catálogo.
12. **Configuración de Despliegue en la Nube (Vercel & Render)**: Incorporación de `client/vercel.json` con reglas de reescritura SPA y documentación del flujo de producción.

---

## 📍 Casa Taller Oficial

* **Ubicación**: Av. San Juan 2847, C1232AAB — Barrio de San Cristóbal, Ciudad Autónoma de Buenos Aires, Argentina.
* **Horarios de Atención**: Lunes a Viernes de 10:00 a 19:00 hs · Sábados de 10:00 a 14:00 hs.
* **WhatsApp y Consultas**: `+54 11 4567-8900`
* **Correo Electrónico**: `info@hermanosjota.com.ar`
* **Instagram Oficial**: [`@hermanosjota_ba`](https://instagram.com/hermanosjota_ba)
