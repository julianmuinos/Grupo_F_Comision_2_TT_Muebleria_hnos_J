# Documentación de API de Autenticación (`/api/auth`)

Documentación de contratos para el equipo de Frontend (**Franco**, **Julian**, **Santino**) y Backend (**Emanuel**).
Implementado por **Alexis Fernando Rojas**.

---

## Variables de entorno requeridas en `backend/.env`

```env
JWT_SECRET=<clave_secreta_larga_y_segura>
JWT_EXPIRES_IN=7d
```

- `JWT_SECRET` es obligatoria: si falta, la firma/verificación de tokens lanza error de configuración (sin secretos hardcodeados).
- `JWT_EXPIRES_IN` es opcional (por defecto `7d`).

---

## 1. Registro de usuario — `POST /api/auth/register`

**Acceso:** Público  
**Content-Type:** `application/json`

### Request Body

```json
{
  "nombre": "María Gómez",
  "email": "maria@ejemplo.com",
  "password": "clave123"
}
```

### Reglas de validación

- `nombre`: obligatorio, mínimo **2 caracteres** (se aplica `trim`).
- `email`: obligatorio, formato válido de correo (se aplica `trim` y `lowercase`).
- `password`: obligatoria, mínimo **5 caracteres** (se almacena hasheada con `bcryptjs`).

### Respuestas

- **`201 Created`** (Registro exitoso):

```json
{
  "success": true,
  "message": "Usuario registrado exitosamente.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "673f1a2b3c4d5e6f7a8b9c0d",
    "nombre": "María Gómez",
    "email": "maria@ejemplo.com"
  }
}
```

- **`400 Bad Request`** (Campos faltantes o inválidos):

```json
{
  "success": false,
  "status": 400,
  "message": "La contraseña debe tener al menos 5 caracteres.",
  "errores": [
    "La contraseña debe tener al menos 5 caracteres."
  ]
}
```

- **`409 Conflict`** (Email ya registrado):

```json
{
  "success": false,
  "status": 409,
  "message": "Ya existe un usuario registrado con ese correo electrónico."
}
```

---

## 2. Inicio de sesión — `POST /api/auth/login`

**Acceso:** Público  
**Content-Type:** `application/json`

### Request Body

```json
{
  "email": "maria@ejemplo.com",
  "password": "clave123"
}
```

### Reglas de validación

- `email`: obligatorio, formato válido de correo (se aplica `trim` y `lowercase`).
- `password`: obligatoria (no puede estar vacía).

### Respuestas

- **`200 OK`** (Credenciales válidas):

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

- **`400 Bad Request`** (Faltan campos o formato inválido): devuelve `{ success: false, status: 400, message, errores }`.
- **`401 Unauthorized`** (Email inexistente o contraseña incorrecta):

```json
{
  "success": false,
  "status": 401,
  "message": "Credenciales inválidas. Verificá tu email y contraseña."
}
```

---

## 3. Uso del `authMiddleware` (para rutas protegidas)

Para cualquier endpoint protegido (ej. `GET /api/auth/profile`, `POST /api/orders`, `GET /api/orders/my-orders`):

- **Header esperado:**
  ```http
  Authorization: Bearer <token>
  ```
- **Ante token ausente, malformado, inválido, expirado o usuario inexistente:** responde **`401 Unauthorized`**:
  ```json
  {
    "success": false,
    "status": 401,
    "message": "Acceso no autorizado. Token no proporcionado."
  }
  ```
- **Ante token válido:** inyecta `req.user` (documento Mongoose del usuario **sin el campo `password`**), con acceso directo a `req.user.id`, `req.user._id`, `req.user.nombre`, `req.user.email` y `req.user.createdAt`.
