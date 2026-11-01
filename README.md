# E-commerce Mueblería Hermanos Jota 🪵
## Trabajo Práctico Integrador — Sprints 3, 4, 5 y 6 | ITBA (Comisión 2 TT · Grupo F)

Repositorio oficial del equipo para el desarrollo de la plataforma e-commerce y cotizador interactivo de **Mueblería Hermanos Jota**, basada en una arquitectura Cliente-Servidor desacoplada con **Node.js + Express** y **MongoDB Atlas (Mongoose)** en el backend, y **React 19 + Vite + Axios** en el frontend, lista para despliegue en la nube en **Render** y **Vercel**.

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

La solución adopta una **arquitectura desacoplada en capas (Client-Server con Base de Datos en la Nube)**:

```text
┌────────────────────────────────────────────────────────┐
│             CLIENTE (Frontend en Vercel)               │
│      React 19 + Vite + Tailwind CSS + Axios            │
│      Despliegue: https://<tu-app>.vercel.app           │
├────────────────────────────────────────────────────────┤
│  • Enrutamiento SPA con soporte vercel.json (rewrites) │
│  • Custom Hook useProducts con AbortController         │
│  • Instancia centralizada Axios apiClient (api.js)     │
│  • Grilla con Skeleton Loading Shimmer durante carga   │
│  • Manejo amigable de estados de error de red y API    │
└───────────────────────────┬────────────────────────────┘
                            │
                    Peticiones HTTP (REST API)
                    JSON Payloads (CORS dinámico por CLIENT_URL)
                            │
┌───────────────────────────▼────────────────────────────┐
│             SERVIDOR (Backend API en Render)           │
│          Node.js + Express 4 + Dotenv (API REST)       │
│          Despliegue: https://<tu-api>.onrender.com     │
├────────────────────────────────────────────────────────┤
│  • Controladores desacoplados (CRUD completo - MVC)    │
│  • Router /api/productos y alias /api/products         │
│  • Middlewares: Auditoría, Validaciones y Errores      │
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
│  • Colección: productos (11 piezas oficiales)          │
│  • Clave primaria nativa: _id (ObjectId)               │
│  • Índices optimizados por categoría y destacados      │
└────────────────────────────────────────────────────────┘
```

### Características del Backend
* **Conexión a MongoDB Atlas con Mongoose**: Módulo desacoplado en `config/db.js` con manejo de excepciones `try/catch`, validación estricta de `MONGO_URI` y consola decorada con host y base de datos.
* **Gestión de Entorno con Dotenv**: Centralización de variables críticas (`PORT`, `MONGO_URI`, `CLIENT_URL`) mediante `.env`, con plantillas seguras `.env.example` versionadas en el repositorio.
* **CORS Dinámico**: Configurado para restringir accesos exclusivamente al origen `CLIENT_URL` (o permitir todos en desarrollo si no está definido).
* **Controladores Asíncronos con CRUD Completo (MVC)**: Implementación de operaciones de consulta (`obtenerProductos`, `obtenerProductoPorId`) y mutaciones (`crearProducto`, `actualizarProducto`, `eliminarProducto`) contra MongoDB Atlas.
* **Capa de Validaciones Robustas (`middlewares/validaciones.js`)**: Middlewares dedicados para validar campos obligatorios y coherencia numérica en creación (`validarCrearProducto`), actualización parcial (`validarActualizarProducto`) y validación estricta de formato `ObjectId` (`validarIdMongo`), retornando `400 Bad Request` ante entradas inválidas.
* **Soporte de Endpoints Bilingües**: Montaje simultáneo en `/api/productos` y en `/api/products` para interoperabilidad con clientes en inglés o español.
* **Script de Sembrado Masivo (Seed)**: Script ejecutable `seed.js` idempotente que vacía la colección previa y carga los 11 muebles del catálogo oficial en Atlas con `npm run seed`.

### Características del Frontend
* **Single Page Application (SPA)**: Desarrollada con React 19 y Vite para una navegación fluida e instantánea, con configuración de reescritura en `client/vercel.json` para soportar navegación directa y recargas de página sin errores 404 en producción.
* **Cliente HTTP con Axios (`apiClient`)**: Instancia centralizada en `src/services/api.js` configurada con `baseURL` dinámica desde `VITE_API_URL`, `timeout: 10000ms` y headers JSON por defecto.
* **Custom Hook `useProducts`**: Encapsula en `src/hooks/useProducts.js` la lógica asíncrona de obtención del catálogo, retornando `{ products, loading, error }` y protegiendo el ciclo de vida con `AbortController`.
* **Grilla Skeleton de Carga (Shimmer)**: Mientras `loading === true`, `ProductList.jsx` renderiza 6 tarjetas *skeleton* con animación de pulso que simulan la estructura de imagen, título, precio y materiales.
* **Manejo Amigable de Errores**: Visualización de alertas de conexión con botón de reintento ante caídas de servidor o fallas de red.
* **Tarjetas Dinámicas de Producto (`ProductCard`)**: Lectura de datos reales eliminando fallbacks hardcodeados, priorizando propiedades bilingües (`product.name`, `product.price`, `product.materials`, etc.).
* **Ficha de Detalle de Producto (`ProductDetail`)**: Vista inmersiva con especificaciones técnicas completas, selector de acabados de madera y agregado al carrito.
* **Carrito y Cotizador Global**: Persistido en `localStorage`, cálculo de subtotales y regla de envío gratis superando $1.500.000 ARS.
* **Formulario de Contacto Controlado (`ContactForm`)**: 100% gestionado con `useState`, validaciones sincrónicas y vista de Casa Taller georreferenciada.

---

## 📐 Estructura del Proyecto

```text
Grupo_F_Comision_2_TT_Sprint_3-4_Muebleria_hnos_J/
├── backend/
│   ├── config/
│   │   └── db.js                 # Conexión a MongoDB Atlas mediante Mongoose
│   ├── controllers/
│   │   └── productos.controller.js # Controladores CRUD (lecturas y mutaciones)
│   ├── data/
│   │   └── productos.js          # Catálogo original de referencia y datos del seed
│   ├── middlewares/
│   │   ├── errorHandler.js       # Manejador 404 y middleware centralizado de errores
│   │   ├── logger.js             # Middleware global de auditoría con timestamp
│   │   └── validaciones.js       # Validaciones de body y formato ObjectId
│   ├── models/
│   │   └── Producto.js           # Esquema y modelo Mongoose con _id nativo
│   ├── routes/
│   │   └── productos.routes.js   # Rutas GET, POST, PUT y DELETE (/api/productos y /api/products)
│   ├── index.js                  # Servidor Express con CORS, dotenv y rutas
│   ├── seed.js                   # Script de sembrado masivo e idempotente
│   ├── .env.example              # Plantilla de variables de entorno para backend
│   ├── package.json              # Dependencias (express, cors, mongoose, dotenv)
│   └── package-lock.json
│
├── client/
│   ├── public/
│   │   ├── assets/images/        # Fotografías de autor y logotipo SVG oficial
│   │   ├── favicon.svg           # Isotipo vectorial de la marca
│   │   └── icons.svg             # Sprite de iconos SVG
│   ├── src/
│   │   ├── api/
│   │   │   └── productos.js      # Capa de consumo del catálogo usando apiClient
│   │   ├── components/
│   │   │   ├── CartModal.jsx     # Drawer del carrito/cotizador con cálculo de envío
│   │   │   ├── ContactForm.jsx   # Formulario controlado 100% con useState y validación
│   │   │   ├── ContactView.jsx   # Vista de contacto y datos oficiales de Casa Taller
│   │   │   ├── Footer.jsx        # Pie institucional con certificación FSC® y origen
│   │   │   ├── HomeView.jsx      # Portada editorial con piezas destacadas y pilares
│   │   │   ├── MobileSidebar.jsx # Menú drawer deslizable para mobile con createPortal
│   │   │   ├── Navbar.jsx        # Barra superior con logo, enlaces y botón hamburguesa
│   │   │   ├── ProductCard.jsx   # Tarjeta de producto con datos reales y precios ARS
│   │   │   ├── ProductDetail.jsx # Ficha detallada con especificaciones y consumo por ID
│   │   │   └── ProductList.jsx   # Grilla interactiva, useProducts y skeleton loading
│   │   ├── hooks/
│   │   │   └── useProducts.js    # Custom hook reactivo (products, loading, error)
│   │   ├── services/
│   │   │   └── api.js            # Instancia centralizada de Axios (apiClient)
│   │   ├── App.css               # Estilos responsive, tokens y animación skeleton
│   │   ├── App.jsx               # Enrutamiento con React Router y estado del carrito
│   │   ├── index.css             # Reseteo base y configuración de Tailwind CSS
│   │   └── main.jsx              # Renderizado principal de la aplicación React 19
│   ├── index.html                # Plantilla HTML5 con metadatos y fuentes
│   ├── vercel.json               # Configuración de reescritura para rutas SPA en Vercel
│   ├── .env.example              # Plantilla de variable VITE_API_URL
│   ├── vite.config.js            # Configuración del bundler Vite
│   ├── eslint.config.js          # Reglas de linting y buenas prácticas de código
│   └── package.json              # Dependencias de React 19, Axios, Tailwind CSS
│
├── .gitignore                    # Reglas de exclusión unificadas (node_modules, .env, dist)
├── .prettierignore               # Exclusiones globales de formateo
├── .prettierrc                   # Reglas de formateo de código unificado
└── README.md                     # Documentación integral del proyecto
```

---

## 🔌 Endpoints de la API REST

| Método | Endpoint | Parámetros Query / URL | Descripción | Respuestas HTTP |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | — | Comprobación de estado del servidor (*Health check*). | `200 OK` |
| `GET` | `/api/productos`<br>`/api/products` | `?categoria=asientos`<br>`?destacados=true` | Obtiene el catálogo completo desde MongoDB Atlas (con soporte de filtros opcionales). | `200 OK`<br>`500 Error interno` |
| `GET` | `/api/productos/:id`<br>`/api/products/:id` | `:id` (`ObjectId` hexadecimal de 24 caracteres) | Obtiene el detalle técnico y especificaciones de un mueble según su `_id` de MongoDB. | `200 OK`<br>`400 ID inválido`<br>`404 No encontrado`<br>`500 Error interno` |
| `POST` | `/api/productos`<br>`/api/products` | Body JSON con campos del producto | Da de alta un nuevo producto en MongoDB con validación de campos obligatorios y normalización bilingüe. | `201 Created`<br>`400 Datos inválidos`<br>`500 Error interno` |
| `PUT` | `/api/productos/:id`<br>`/api/products/:id` | `:id` (`ObjectId`), Body JSON | Modifica la información de un producto existente en la base de datos aplicando validaciones. | `200 OK`<br>`400 ID/Datos inválidos`<br>`404 No encontrado`<br>`500 Error interno` |
| `DELETE` | `/api/productos/:id`<br>`/api/products/:id` | `:id` (`ObjectId` hexadecimal) | Elimina un producto de la colección en MongoDB Atlas por su identificador. | `200 OK`<br>`400 ID inválido`<br>`404 No encontrado`<br>`500 Error interno` |

### Formato de Respuestas de la API

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

Crear el archivo `.env` dentro de `backend/` a partir de la plantilla:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/muebleria_hermanos_jota?retryWrites=true&w=majority
```

**Sembrar la base de datos (Primera vez):**
Para inicializar la base de datos en Atlas con las 11 piezas oficiales:
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

## 🔍 Registro de Mejoras y Calidad de Código (Sprints 4, 5 y 6)

1. **Unificación y Optimización de `.gitignore` y `.prettierignore`**: Consolidación en la raíz con reglas `.env.*` exhaustivas, exclusión de cachés (`.eslintcache`) y cobertura de testing (`coverage/`).
2. **Persistencia NoSQL en la Nube**: Migración exitosa de catálogo estático en memoria a base de datos distribuida en MongoDB Atlas mediante Mongoose 9.
3. **Identificadores Nativos de MongoDB**: Adopción de `_id` (`ObjectId`) como clave primaria técnica única, resolviendo ambigüedades e inconsistencias de auto-incrementos manuales.
4. **CRUD Completo con Manejo de Estado HTTP**: Implementación de `POST /api/productos` (201 Created), `PUT /api/productos/:id` (200 OK) y `DELETE /api/productos/:id` (200 OK).
5. **Capa Centralizada de Validaciones (`validaciones.js`)**: Verificación de presencia, tipos y coherencia de datos previa a la persistencia con respuestas `400 Bad Request`.
6. **Resiliencia de Conexión de Servidor**: El servidor Express condiciona el inicio del listener HTTP a la confirmación previa del handshake con MongoDB Atlas.
7. **CORS Orientado a Entorno**: Restricción automática de acceso al origen `CLIENT_URL` en producción y apertura controlada en desarrollo.
8. **Capa de Servicios Desacoplada**: Implementación de la instancia `apiClient` con Axios en `src/services/api.js` con timeout de 10 segundos y headers estándar.
9. **Custom Hook Reactivo (`useProducts`)**: Desacoplamiento de la lógica de red de los componentes de vista, implementando ciclo de vida seguro con `AbortController`.
10. **Feedback Visual Inmediato (Skeleton Loader)**: Reemplazo de pantallas de bloqueo estáticas por esqueletos con efecto shimmer en la grilla del catálogo.
11. **Eliminación de Datos Hardcodeados**: Adaptación de `ProductCard` para renderizar propiedades dinámicas reales provenientes de la base de datos.
12. **Configuración de Despliegue en la Nube (Vercel & Render)**: Incorporación de `client/vercel.json` con reglas de reescritura SPA y documentación del flujo de producción.

---

## 📍 Casa Taller Oficial

* **Ubicación**: Av. San Juan 2847, C1232AAB — Barrio de San Cristóbal, Ciudad Autónoma de Buenos Aires, Argentina.
* **Horarios de Atención**: Lunes a Viernes de 10:00 a 19:00 hs · Sábados de 10:00 a 14:00 hs.
* **WhatsApp y Consultas**: `+54 11 4567-8900`
* **Correo Electrónico**: `info@hermanosjota.com.ar`
* **Instagram Oficial**: [`@hermanosjota_ba`](https://instagram.com/hermanosjota_ba)
