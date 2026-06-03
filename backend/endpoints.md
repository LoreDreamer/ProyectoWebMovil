# Enpoints

## 1. Base URL local

```txt
http://localhost:3000
```

### Prefijo general

La API utiliza el prefijo:

```txt
/api
```

Por ejemplo:

```txt
http://localhost:3000/api/auth/login
```

---

## 2. Formato general de respuestas

### Respuesta exitosa esperada

```json
{
  "ok": true,
  "message": "Operación realizada correctamente.",
  "data": {}
}
```

En algunos endpoints de listado, la API puede devolver directamente un arreglo JSON de registros.

### Respuesta de error esperada

```json
{
  "ok": false,
  "message": "Descripción del error."
}
```

También pueden existir respuestas con el formato:

```json
{
  "message": "Token no proporcionado"
}
```

o:

```json
{
  "message": "Acceso denegado: se requieren permisos de administrador"
}
```

---

## 3. Códigos HTTP utilizados

| Código | Significado           | Uso esperado                                                |
| ------ | --------------------- | ----------------------------------------------------------- |
| 200    | OK                    | Consulta, edición o acción realizada correctamente          |
| 201    | Created               | Recurso creado correctamente                                |
| 204    | No Content            | Eliminación correcta sin cuerpo de respuesta                |
| 400    | Bad Request           | Datos inválidos, campos faltantes o archivo no permitido    |
| 401    | Unauthorized          | No se proporcionó token JWT                                 |
| 403    | Forbidden             | Token inválido, expirado o usuario sin permisos             |
| 404    | Not Found             | Recurso no encontrado                                       |
| 409    | Conflict              | Duplicidad de datos, por ejemplo correo o RUT ya registrado |
| 500    | Internal Server Error | Error interno del servidor                                  |

---

## 4. Autenticación

Las rutas protegidas requieren el siguiente header:

```txt
Authorization: Bearer JWT_TOKEN
```

Existen dos niveles de acceso:

| Tipo de acceso      | Descripción                             |
| ------------------- | --------------------------------------- |
| Público             | No requiere token                       |
| Usuario autenticado | Requiere token JWT válido               |
| Administrador       | Requiere token JWT válido y rol `admin` |

---

## 5. Endpoints de autenticación y usuarios

### 5.1 Registrar usuario

```txt
POST /api/auth/register
```

Registra un nuevo usuario en el sistema.

**Acceso:** Público.

### Body JSON

```json
{
  "rut": "11111111-1",
  "nombre_completo": "Usuario Prueba",
  "region": "Valparaíso",
  "comuna": "Santo Domingo",
  "correo": "usuario@test.com",
  "password": "1234"
}
```

### Respuestas esperadas

| Status | Caso                         | Respuesta esperada                         |
| ------ | ---------------------------- | ------------------------------------------ |
| 201    | Usuario creado               | Usuario registrado correctamente           |
| 400    | Campos faltantes o inválidos | Mensaje indicando el error de validación   |
| 409    | Correo o RUT duplicado       | Mensaje indicando que el usuario ya existe |
| 500    | Error interno                | Mensaje de error interno                   |

---

### 5.2 Iniciar sesión

```txt
POST /api/auth/login
```

Permite iniciar sesión y obtener un token JWT.

**Acceso:** Público.

### Body JSON

```json
{
  "correo": "lalo@admin.com",
  "password": "1234"
}
```

### Respuesta exitosa esperada

```json
{
  "ok": true,
  "message": "Login correcto.",
  "token": "JWT_TOKEN",
  "user": {
    "id": "uuid",
    "correo": "lalo@admin.com",
    "role": "admin"
  }
}
```

### Respuestas esperadas

| Status | Caso                     | Respuesta esperada                    |
| ------ | ------------------------ | ------------------------------------- |
| 200    | Credenciales correctas   | Retorna token JWT y datos del usuario |
| 400    | Faltan credenciales      | Mensaje de validación                 |
| 401    | Credenciales incorrectas | No entrega token                      |
| 500    | Error interno            | Mensaje de error interno              |

---

### 5.3 Obtener usuario autenticado

```txt
GET /api/auth/me
```

Obtiene los datos del usuario autenticado mediante el token JWT.

**Acceso:** Usuario autenticado.

### Headers

```txt
Authorization: Bearer JWT_TOKEN
```

### Respuestas esperadas

| Status | Caso                      | Respuesta esperada                    |
| ------ | ------------------------- | ------------------------------------- |
| 200    | Token válido              | Retorna datos del usuario autenticado |
| 401    | No se envía token         | `Token no proporcionado`              |
| 403    | Token inválido o expirado | `Token inválido o expirado`           |
| 500    | Error interno             | Mensaje de error interno              |

---

### 5.4 Listar usuarios

```txt
GET /api/auth/users
```

Lista los usuarios registrados en el sistema.

**Acceso:** Administrador.

### Headers

```txt
Authorization: Bearer JWT_TOKEN_ADMIN
```

### Respuestas esperadas

| Status | Caso              | Respuesta esperada                                        |
| ------ | ----------------- | --------------------------------------------------------- |
| 200    | Admin autenticado | Retorna lista de usuarios                                 |
| 401    | No se envía token | `Token no proporcionado`                                  |
| 403    | Usuario no admin  | `Acceso denegado: se requieren permisos de administrador` |
| 500    | Error interno     | Mensaje de error interno                                  |

---

### 5.5 Editar usuario

```txt
PUT /api/auth/users/:id
```

Edita los datos de un usuario existente.

**Acceso:** Administrador.

### Headers

```txt
Authorization: Bearer JWT_TOKEN_ADMIN
```

### Body JSON ejemplo

```json
{
  "nombre_completo": "Nuevo Nombre",
  "region": "Valparaíso",
  "comuna": "Santo Domingo",
  "correo": "nuevo@test.com",
  "estatus": "activo",
  "tipo_usuario": "user"
}
```

### Respuestas esperadas

| Status | Caso                   | Respuesta esperada          |
| ------ | ---------------------- | --------------------------- |
| 200    | Usuario actualizado    | Retorna usuario actualizado |
| 400    | Datos inválidos        | Mensaje de validación       |
| 401    | No se envía token      | `Token no proporcionado`    |
| 403    | Usuario no admin       | Acceso denegado             |
| 404    | Usuario no existe      | Usuario no encontrado       |
| 409    | Correo o RUT duplicado | Conflicto de datos          |
| 500    | Error interno          | Mensaje de error interno    |

---

### 5.6 Eliminar usuario

```txt
DELETE /api/auth/users/:id
```

Elimina un usuario existente.

**Acceso:** Administrador.

### Headers

```txt
Authorization: Bearer JWT_TOKEN_ADMIN
```

### Respuestas esperadas

| Status | Caso                         | Respuesta esperada              |
| ------ | ---------------------------- | ------------------------------- |
| 200    | Usuario eliminado            | Mensaje de eliminación correcta |
| 204    | Usuario eliminado sin cuerpo | Sin contenido                   |
| 401    | No se envía token            | `Token no proporcionado`        |
| 403    | Usuario no admin             | Acceso denegado                 |
| 404    | Usuario no existe            | Usuario no encontrado           |
| 500    | Error interno                | Mensaje de error interno        |

---

## 6. Endpoints de alertas

### 6.1 Listar alertas

```txt
GET /api/alerts
```

Lista las alertas o noticias de ciberseguridad.

**Acceso:** Público.

### Respuestas esperadas

| Status | Caso              | Respuesta esperada       |
| ------ | ----------------- | ------------------------ |
| 200    | Consulta correcta | Retorna lista de alertas |
| 500    | Error interno     | Mensaje de error interno |

---

### 6.2 Suscribirse a alertas desde módulo de alertas

```txt
POST /api/alerts/subscribe
```

Registra un correo para recibir alertas.

**Acceso:** Público.

### Body JSON

```json
{
  "email": "correo@dominio.com"
}
```

### Respuestas esperadas

| Status | Caso                            | Respuesta esperada                   |
| ------ | ------------------------------- | ------------------------------------ |
| 201    | Suscripción registrada          | Retorna datos de la suscripción      |
| 400    | Correo inválido                 | Mensaje de validación                |
| 409    | Correo ya registrado, si aplica | Mensaje de conflicto o actualización |
| 500    | Error interno                   | Mensaje de error interno             |

---

### 6.3 Crear alerta

```txt
POST /api/alerts
```

Crea una nueva alerta o noticia de ciberseguridad.

**Acceso:** Administrador.

### Headers

```txt
Authorization: Bearer JWT_TOKEN_ADMIN
```

### Body JSON ejemplo

```json
{
  "titulo": "Alerta de prueba",
  "resumen": "Resumen breve de la alerta.",
  "cuerpo": "Contenido completo de la alerta.",
  "escrito_por": "Administrador"
}
```

También puede recibir imágenes mediante `multipart/form-data`.

### Campos form-data permitidos

| Campo    | Tipo      | Descripción          |
| -------- | --------- | -------------------- |
| portada  | archivo   | Imagen principal     |
| imagen   | archivo   | Imagen individual    |
| imagenes | archivo[] | Imágenes adicionales |

### Respuestas esperadas

| Status | Caso                                   | Respuesta esperada       |
| ------ | -------------------------------------- | ------------------------ |
| 201    | Alerta creada                          | Retorna alerta creada    |
| 400    | Datos inválidos o archivo no permitido | Mensaje de validación    |
| 401    | No se envía token                      | `Token no proporcionado` |
| 403    | Usuario no admin                       | Acceso denegado          |
| 500    | Error interno                          | Mensaje de error interno |

---

### 6.4 Editar alerta

```txt
PUT /api/alerts/:id
```

Edita una alerta existente.

**Acceso:** Administrador.

### Headers

```txt
Authorization: Bearer JWT_TOKEN_ADMIN
```

### Body JSON ejemplo

```json
{
  "titulo": "Alerta actualizada",
  "resumen": "Nuevo resumen.",
  "cuerpo": "Nuevo contenido.",
  "escrito_por": "Administrador"
}
```

También puede recibir imágenes mediante `multipart/form-data`.

### Respuestas esperadas

| Status | Caso                                                | Respuesta esperada               |
| ------ | --------------------------------------------------- | -------------------------------- |
| 200    | Alerta actualizada                                  | Retorna alerta actualizada       |
| 400    | Datos inválidos, ID inválido o archivo no permitido | Mensaje de validación            |
| 401    | No se envía token                                   | `Token no proporcionado`         |
| 403    | Usuario no admin                                    | Acceso denegado                  |
| 404    | Alerta no encontrada                                | Mensaje de recurso no encontrado |
| 500    | Error interno                                       | Mensaje de error interno         |

---

### 6.5 Eliminar alerta

```txt
DELETE /api/alerts/:id
```

Elimina una alerta existente.

**Acceso:** Administrador.

### Headers

```txt
Authorization: Bearer JWT_TOKEN_ADMIN
```

### Respuestas esperadas

| Status | Caso                        | Respuesta esperada               |
| ------ | --------------------------- | -------------------------------- |
| 200    | Alerta eliminada            | Mensaje de eliminación correcta  |
| 204    | Alerta eliminada sin cuerpo | Sin contenido                    |
| 400    | ID inválido                 | Mensaje de validación            |
| 401    | No se envía token           | `Token no proporcionado`         |
| 403    | Usuario no admin            | Acceso denegado                  |
| 404    | Alerta no encontrada        | Mensaje de recurso no encontrado |
| 500    | Error interno               | Mensaje de error interno         |

---

## 7. Endpoints de suscripciones

### 7.1 Registrar suscripción

```txt
POST /api/subscriptions
```

Registra un correo para recibir alertas.

**Acceso:** Público.

### Body JSON

```json
{
  "email": "test@example.com"
}
```

### Respuestas esperadas

| Status | Caso                        | Respuesta esperada                       |
| ------ | --------------------------- | ---------------------------------------- |
| 201    | Suscripción registrada      | Retorna suscripción creada o actualizada |
| 400    | Correo inválido             | Mensaje de validación                    |
| 409    | Correo duplicado, si aplica | Mensaje de conflicto                     |
| 500    | Error interno               | Mensaje de error interno                 |

---

## 8. Endpoints de denuncias

### 8.1 Crear denuncia

```txt
POST /api/denuncias
```

Registra una denuncia o reporte de incidente.

**Acceso:** Público.

### Body JSON ejemplo

```json
{
  "tipo_incidente": "phishing",
  "descripcion": "Recibí un correo sospechoso con enlaces desconocidos.",
  "correo": "usuario@test.com",
  "nombre_completo": "Usuario Prueba"
}
```

También puede recibir archivos mediante `multipart/form-data`.

### Campos form-data permitidos

| Campo    | Tipo      | Descripción       |
| -------- | --------- | ----------------- |
| archivo  | archivo   | Archivo adjunto   |
| archivos | archivo[] | Archivos adjuntos |

### Respuestas esperadas

| Status | Caso                                   | Respuesta esperada       |
| ------ | -------------------------------------- | ------------------------ |
| 201    | Denuncia registrada                    | Retorna denuncia creada  |
| 400    | Datos inválidos o archivo no permitido | Mensaje de validación    |
| 500    | Error interno                          | Mensaje de error interno |

---

### 8.2 Listar denuncias

```txt
GET /api/denuncias
```

Lista las denuncias registradas.

**Acceso:** Administrador.

### Headers

```txt
Authorization: Bearer JWT_TOKEN_ADMIN
```

### Respuestas esperadas

| Status | Caso              | Respuesta esperada         |
| ------ | ----------------- | -------------------------- |
| 200    | Admin autenticado | Retorna lista de denuncias |
| 401    | No se envía token | `Token no proporcionado`   |
| 403    | Usuario no admin  | Acceso denegado            |
| 500    | Error interno     | Mensaje de error interno   |

---

## 9. Endpoints de protocolos

### 9.1 Listar protocolos

```txt
GET /api/protocolos
```

Lista los protocolos disponibles.

**Acceso:** Público según configuración actual del backend.

### Respuestas esperadas

| Status | Caso              | Respuesta esperada          |
| ------ | ----------------- | --------------------------- |
| 200    | Consulta correcta | Retorna lista de protocolos |
| 500    | Error interno     | Mensaje de error interno    |

---

### 9.2 Crear protocolo

```txt
POST /api/protocolos
```

Crea un nuevo protocolo.

**Acceso:** Administrador.

### Headers

```txt
Authorization: Bearer JWT_TOKEN_ADMIN
```

### Body JSON ejemplo

```json
{
  "titulo": "Protocolo de correo electrónico",
  "resumen": "Recomendaciones para actuar frente a correos sospechosos.",
  "categoria": "Ciberseguridad"
}
```

También puede recibir archivos mediante `multipart/form-data`.

### Campos form-data permitidos

| Campo    | Tipo      | Descripción          |
| -------- | --------- | -------------------- |
| archivo  | archivo   | Archivo principal    |
| archivos | archivo[] | Archivos adicionales |

### Respuestas esperadas

| Status | Caso                                   | Respuesta esperada       |
| ------ | -------------------------------------- | ------------------------ |
| 201    | Protocolo creado                       | Retorna protocolo creado |
| 400    | Datos inválidos o archivo no permitido | Mensaje de validación    |
| 401    | No se envía token                      | `Token no proporcionado` |
| 403    | Usuario no admin                       | Acceso denegado          |
| 500    | Error interno                          | Mensaje de error interno |

---

### 9.3 Editar protocolo

```txt
PUT /api/protocolos/:id
```

Edita un protocolo existente.

**Acceso:** Administrador.

### Headers

```txt
Authorization: Bearer JWT_TOKEN_ADMIN
```

### Body JSON ejemplo

```json
{
  "titulo": "Protocolo actualizado",
  "resumen": "Resumen actualizado.",
  "categoria": "Teletrabajo"
}
```

También puede recibir archivos mediante `multipart/form-data`.

### Respuestas esperadas

| Status | Caso                                                | Respuesta esperada               |
| ------ | --------------------------------------------------- | -------------------------------- |
| 200    | Protocolo actualizado                               | Retorna protocolo actualizado    |
| 400    | Datos inválidos, ID inválido o archivo no permitido | Mensaje de validación            |
| 401    | No se envía token                                   | `Token no proporcionado`         |
| 403    | Usuario no admin                                    | Acceso denegado                  |
| 404    | Protocolo no encontrado                             | Mensaje de recurso no encontrado |
| 500    | Error interno                                       | Mensaje de error interno         |

---

### 9.4 Eliminar protocolo

```txt
DELETE /api/protocolos/:id
```

Elimina un protocolo existente.

**Acceso:** Administrador.

### Headers

```txt
Authorization: Bearer JWT_TOKEN_ADMIN
```

### Respuestas esperadas

| Status | Caso                           | Respuesta esperada               |
| ------ | ------------------------------ | -------------------------------- |
| 200    | Protocolo eliminado            | Mensaje de eliminación correcta  |
| 204    | Protocolo eliminado sin cuerpo | Sin contenido                    |
| 400    | ID inválido                    | Mensaje de validación            |
| 401    | No se envía token              | `Token no proporcionado`         |
| 403    | Usuario no admin               | Acceso denegado                  |
| 404    | Protocolo no encontrado        | Mensaje de recurso no encontrado |
| 500    | Error interno                  | Mensaje de error interno         |

---

## 10. Endpoints de actividades

### 10.1 Listar actividades

```txt
GET /api/activities
```

Lista actividades disponibles.

**Acceso:** Público.

### Respuestas esperadas

| Status | Caso              | Respuesta esperada           |
| ------ | ----------------- | ---------------------------- |
| 200    | Consulta correcta | Retorna lista de actividades |
| 500    | Error interno     | Mensaje de error interno     |

---

### 10.2 Crear actividad

```txt
POST /api/activities
```

Crea una nueva actividad.

**Acceso:** Administrador.

### Headers

```txt
Authorization: Bearer JWT_TOKEN_ADMIN
```

### Body JSON ejemplo

```json
{
  "titulo": "Charla de ciberseguridad",
  "descripcion": "Actividad educativa para la comunidad.",
  "fecha": "2026-06-10"
}
```

### Respuestas esperadas

| Status | Caso              | Respuesta esperada       |
| ------ | ----------------- | ------------------------ |
| 201    | Actividad creada  | Retorna actividad creada |
| 400    | Datos inválidos   | Mensaje de validación    |
| 401    | No se envía token | `Token no proporcionado` |
| 403    | Usuario no admin  | Acceso denegado          |
| 500    | Error interno     | Mensaje de error interno |

---

### 10.3 Editar actividad

```txt
PUT /api/activities/:id
```

Edita una actividad existente.

**Acceso:** Administrador.

### Headers

```txt
Authorization: Bearer JWT_TOKEN_ADMIN
```

### Body JSON ejemplo

```json
{
  "titulo": "Charla actualizada",
  "descripcion": "Nueva descripción de la actividad.",
  "fecha": "2026-06-15"
}
```

### Respuestas esperadas

| Status | Caso                          | Respuesta esperada               |
| ------ | ----------------------------- | -------------------------------- |
| 200    | Actividad actualizada         | Retorna actividad actualizada    |
| 400    | Datos inválidos o ID inválido | Mensaje de validación            |
| 401    | No se envía token             | `Token no proporcionado`         |
| 403    | Usuario no admin              | Acceso denegado                  |
| 404    | Actividad no encontrada       | Mensaje de recurso no encontrado |
| 500    | Error interno                 | Mensaje de error interno         |

---

### 10.4 Eliminar actividad

```txt
DELETE /api/activities/:id
```

Elimina una actividad existente.

**Acceso:** Administrador.

### Headers

```txt
Authorization: Bearer JWT_TOKEN_ADMIN
```

### Respuestas esperadas

| Status | Caso                           | Respuesta esperada               |
| ------ | ------------------------------ | -------------------------------- |
| 200    | Actividad eliminada            | Mensaje de eliminación correcta  |
| 204    | Actividad eliminada sin cuerpo | Sin contenido                    |
| 400    | ID inválido                    | Mensaje de validación            |
| 401    | No se envía token              | `Token no proporcionado`         |
| 403    | Usuario no admin               | Acceso denegado                  |
| 404    | Actividad no encontrada        | Mensaje de recurso no encontrado |
| 500    | Error interno                  | Mensaje de error interno         |

---

## 11. Endpoints de educación

### 11.1 Listar contenidos educativos

```txt
GET /api/education
```

Lista los contenidos educativos disponibles.

**Acceso:** Público.

### Respuestas esperadas

| Status | Caso              | Respuesta esperada                     |
| ------ | ----------------- | -------------------------------------- |
| 200    | Consulta correcta | Retorna lista de contenidos educativos |
| 500    | Error interno     | Mensaje de error interno               |

---

### 11.2 Obtener progreso educativo del usuario

```txt
GET /api/education/progress/me
```

Obtiene el progreso de lectura de contenidos educativos del usuario autenticado.

**Acceso:** Usuario autenticado.

### Headers

```txt
Authorization: Bearer JWT_TOKEN
```

### Respuestas esperadas

| Status | Caso                      | Respuesta esperada           |
| ------ | ------------------------- | ---------------------------- |
| 200    | Progreso obtenido         | Retorna progreso del usuario |
| 401    | No se envía token         | `Token no proporcionado`     |
| 403    | Token inválido o expirado | Token inválido               |
| 500    | Error interno             | Mensaje de error interno     |

---

### 11.3 Marcar módulo educativo como completado

```txt
POST /api/education/:id/complete
```

Marca un contenido educativo como leído o completado por el usuario autenticado.

**Acceso:** Usuario autenticado.

### Headers

```txt
Authorization: Bearer JWT_TOKEN
```

### Respuestas esperadas

| Status | Caso                      | Respuesta esperada               |
| ------ | ------------------------- | -------------------------------- |
| 200    | Módulo completado         | Retorna registro de progreso     |
| 201    | Progreso creado           | Retorna registro creado          |
| 400    | ID inválido               | Mensaje de validación            |
| 401    | No se envía token         | `Token no proporcionado`         |
| 403    | Token inválido o expirado | Token inválido                   |
| 404    | Contenido no encontrado   | Mensaje de recurso no encontrado |
| 500    | Error interno             | Mensaje de error interno         |

---

### 11.4 Crear contenido educativo

```txt
POST /api/education
```

Crea un nuevo contenido educativo.

**Acceso:** Administrador.

### Headers

```txt
Authorization: Bearer JWT_TOKEN_ADMIN
```

### Body JSON ejemplo

```json
{
  "titulo": "Cómo detectar phishing",
  "resumen": "Aprende señales básicas para identificar correos falsos.",
  "cuerpo": "Contenido completo del módulo educativo.",
  "nivel": "facil",
  "tipo_educacion": "Phishing"
}
```

También puede recibir archivos mediante `multipart/form-data`.

### Campos form-data permitidos

| Campo    | Tipo      | Descripción          |
| -------- | --------- | -------------------- |
| portada  | archivo   | Imagen principal     |
| archivo  | archivo   | Documento asociado   |
| imagenes | archivo[] | Imágenes adicionales |

### Respuestas esperadas

| Status | Caso                                   | Respuesta esperada                 |
| ------ | -------------------------------------- | ---------------------------------- |
| 201    | Contenido creado                       | Retorna contenido educativo creado |
| 400    | Datos inválidos o archivo no permitido | Mensaje de validación              |
| 401    | No se envía token                      | `Token no proporcionado`           |
| 403    | Usuario no admin                       | Acceso denegado                    |
| 500    | Error interno                          | Mensaje de error interno           |

---

### 11.5 Editar contenido educativo

```txt
PUT /api/education/:id
```

Edita un contenido educativo existente.

**Acceso:** Administrador.

### Headers

```txt
Authorization: Bearer JWT_TOKEN_ADMIN
```

### Body JSON ejemplo

```json
{
  "titulo": "Contenido educativo actualizado",
  "resumen": "Resumen actualizado.",
  "cuerpo": "Nuevo contenido del módulo.",
  "nivel": "medio",
  "tipo_educacion": "Seguridad"
}
```

También puede recibir archivos mediante `multipart/form-data`.

### Campos form-data permitidos

| Campo    | Tipo      | Descripción          |
| -------- | --------- | -------------------- |
| portada  | archivo   | Imagen principal     |
| archivo  | archivo   | Documento asociado   |
| imagenes | archivo[] | Imágenes adicionales |

### Respuestas esperadas

| Status | Caso                                                | Respuesta esperada                      |
| ------ | --------------------------------------------------- | --------------------------------------- |
| 200    | Contenido actualizado                               | Retorna contenido educativo actualizado |
| 400    | Datos inválidos, ID inválido o archivo no permitido | Mensaje de validación                   |
| 401    | No se envía token                                   | `Token no proporcionado`                |
| 403    | Usuario no admin                                    | Acceso denegado                         |
| 404    | Contenido educativo no encontrado                   | Mensaje de recurso no encontrado        |
| 500    | Error interno                                       | Mensaje de error interno                |

---

### 11.6 Eliminar contenido educativo

```txt
DELETE /api/education/:id
```

Elimina un contenido educativo existente.

**Acceso:** Administrador.

### Headers

```txt
Authorization: Bearer JWT_TOKEN_ADMIN
```

### Respuestas esperadas

| Status | Caso                              | Respuesta esperada               |
| ------ | --------------------------------- | -------------------------------- |
| 200    | Contenido eliminado               | Mensaje de eliminación correcta  |
| 204    | Contenido eliminado sin cuerpo    | Sin contenido                    |
| 400    | ID inválido                       | Mensaje de validación            |
| 401    | No se envía token                 | `Token no proporcionado`         |
| 403    | Usuario no admin                  | Acceso denegado                  |
| 404    | Contenido educativo no encontrado | Mensaje de recurso no encontrado |
| 500    | Error interno                     | Mensaje de error interno         |

---

## 12. Endpoints de cuestionarios

### 12.1 Listar cuestionarios

```txt
GET /api/questionnaires
```

Lista los cuestionarios disponibles.

**Acceso:** Público según configuración actual del backend.

### Respuestas esperadas

| Status | Caso              | Respuesta esperada             |
| ------ | ----------------- | ------------------------------ |
| 200    | Consulta correcta | Retorna lista de cuestionarios |
| 500    | Error interno     | Mensaje de error interno       |

---

### 12.2 Obtener progreso de cuestionarios del usuario

```txt
GET /api/questionnaires/progress/me
```

Obtiene el progreso de cuestionarios del usuario autenticado.

**Acceso:** Usuario autenticado.

### Headers

```txt
Authorization: Bearer JWT_TOKEN
```

### Respuestas esperadas

| Status | Caso                      | Respuesta esperada           |
| ------ | ------------------------- | ---------------------------- |
| 200    | Progreso obtenido         | Retorna progreso del usuario |
| 401    | No se envía token         | `Token no proporcionado`     |
| 403    | Token inválido o expirado | Token inválido               |
| 500    | Error interno             | Mensaje de error interno     |

---

### 12.3 Obtener cuestionario para resolver

```txt
GET /api/questionnaires/:id/resolver
```

Obtiene las preguntas de un cuestionario específico para que el usuario lo resuelva.

**Acceso:** Usuario autenticado.

### Headers

```txt
Authorization: Bearer JWT_TOKEN
```

### Respuestas esperadas

| Status | Caso                       | Respuesta esperada                |
| ------ | -------------------------- | --------------------------------- |
| 200    | Cuestionario obtenido      | Retorna cuestionario y ejercicios |
| 400    | ID inválido                | Mensaje de validación             |
| 401    | No se envía token          | `Token no proporcionado`          |
| 403    | Token inválido o expirado  | Token inválido                    |
| 404    | Cuestionario no encontrado | Mensaje de recurso no encontrado  |
| 500    | Error interno              | Mensaje de error interno          |

---

### 12.4 Responder cuestionario

```txt
POST /api/questionnaires/:id/responder
```

Registra las respuestas del usuario para un cuestionario.

**Acceso:** Usuario autenticado.

### Headers

```txt
Authorization: Bearer JWT_TOKEN
```

### Body JSON ejemplo

```json
{
  "respuestas": [
    {
      "ejercicio_id": "uuid",
      "respuesta": "Alternativa seleccionada"
    }
  ]
}
```

### Respuestas esperadas

| Status | Caso                       | Respuesta esperada                       |
| ------ | -------------------------- | ---------------------------------------- |
| 200    | Respuestas registradas     | Retorna resultado o progreso actualizado |
| 201    | Resultado creado           | Retorna registro creado                  |
| 400    | Datos inválidos            | Mensaje de validación                    |
| 401    | No se envía token          | `Token no proporcionado`                 |
| 403    | Token inválido o expirado  | Token inválido                           |
| 404    | Cuestionario no encontrado | Mensaje de recurso no encontrado         |
| 500    | Error interno              | Mensaje de error interno                 |

---

### 12.5 Completar cuestionario

```txt
POST /api/questionnaires/:id/complete
```

Marca un cuestionario como completado por el usuario autenticado.

**Acceso:** Usuario autenticado.

### Headers

```txt
Authorization: Bearer JWT_TOKEN
```

### Respuestas esperadas

| Status | Caso                       | Respuesta esperada               |
| ------ | -------------------------- | -------------------------------- |
| 200    | Cuestionario completado    | Retorna progreso actualizado     |
| 201    | Registro creado            | Retorna registro creado          |
| 400    | ID inválido                | Mensaje de validación            |
| 401    | No se envía token          | `Token no proporcionado`         |
| 403    | Token inválido o expirado  | Token inválido                   |
| 404    | Cuestionario no encontrado | Mensaje de recurso no encontrado |
| 500    | Error interno              | Mensaje de error interno         |

---

### 12.6 Importar ejercicios de cuestionario por CSV

```txt
POST /api/questionnaires/:id/importar-ejercicios
```

Importa ejercicios/preguntas para un cuestionario desde un archivo CSV.

**Acceso:** Administrador.

### Headers

```txt
Authorization: Bearer JWT_TOKEN_ADMIN
```

### Body multipart/form-data

| Campo | Tipo    | Descripción                     |
| ----- | ------- | ------------------------------- |
| csv   | archivo | Archivo CSV o TXT con preguntas |

### Respuestas esperadas

| Status | Caso                                             | Respuesta esperada               |
| ------ | ------------------------------------------------ | -------------------------------- |
| 200    | Ejercicios importados                            | Retorna resumen de importación   |
| 201    | Ejercicios creados                               | Retorna ejercicios creados       |
| 400    | CSV inválido, ID inválido o archivo no permitido | Mensaje de validación            |
| 401    | No se envía token                                | `Token no proporcionado`         |
| 403    | Usuario no admin                                 | Acceso denegado                  |
| 404    | Cuestionario no encontrado                       | Mensaje de recurso no encontrado |
| 500    | Error interno                                    | Mensaje de error interno         |

---

### 12.7 Crear cuestionario

```txt
POST /api/questionnaires
```

Crea un nuevo cuestionario.

**Acceso:** Administrador.

### Headers

```txt
Authorization: Bearer JWT_TOKEN_ADMIN
```

### Body JSON ejemplo

```json
{
  "titulo": "Cuestionario de phishing",
  "resumen": "Evalúa conocimientos básicos sobre phishing.",
  "riesgo": "bajo",
  "puntaje_maximo": 10
}
```

También puede recibir archivos mediante `multipart/form-data`.

### Campos form-data permitidos

| Campo    | Tipo      | Descripción              |
| -------- | --------- | ------------------------ |
| portada  | archivo   | Imagen principal         |
| archivo  | archivo   | Documento asociado       |
| csv      | archivo   | Archivo CSV de preguntas |
| imagenes | archivo[] | Imágenes adicionales     |

### Respuestas esperadas

| Status | Caso                                   | Respuesta esperada          |
| ------ | -------------------------------------- | --------------------------- |
| 201    | Cuestionario creado                    | Retorna cuestionario creado |
| 400    | Datos inválidos o archivo no permitido | Mensaje de validación       |
| 401    | No se envía token                      | `Token no proporcionado`    |
| 403    | Usuario no admin                       | Acceso denegado             |
| 500    | Error interno                          | Mensaje de error interno    |

---

### 12.8 Editar cuestionario

```txt
PUT /api/questionnaires/:id
```

Edita un cuestionario existente.

**Acceso:** Administrador.

### Headers

```txt
Authorization: Bearer JWT_TOKEN_ADMIN
```

### Body JSON ejemplo

```json
{
  "titulo": "Cuestionario actualizado",
  "resumen": "Resumen actualizado.",
  "riesgo": "medio",
  "puntaje_maximo": 20
}
```

También puede recibir archivos mediante `multipart/form-data`.

### Respuestas esperadas

| Status | Caso                                                | Respuesta esperada               |
| ------ | --------------------------------------------------- | -------------------------------- |
| 200    | Cuestionario actualizado                            | Retorna cuestionario actualizado |
| 400    | Datos inválidos, ID inválido o archivo no permitido | Mensaje de validación            |
| 401    | No se envía token                                   | `Token no proporcionado`         |
| 403    | Usuario no admin                                    | Acceso denegado                  |
| 404    | Cuestionario no encontrado                          | Mensaje de recurso no encontrado |
| 500    | Error interno                                       | Mensaje de error interno         |

---

### 12.9 Eliminar cuestionario

```txt
DELETE /api/questionnaires/:id
```

Elimina un cuestionario existente.

**Acceso:** Administrador.

### Headers

```txt
Authorization: Bearer JWT_TOKEN_ADMIN
```

### Respuestas esperadas

| Status | Caso                              | Respuesta esperada               |
| ------ | --------------------------------- | -------------------------------- |
| 200    | Cuestionario eliminado            | Mensaje de eliminación correcta  |
| 204    | Cuestionario eliminado sin cuerpo | Sin contenido                    |
| 400    | ID inválido                       | Mensaje de validación            |
| 401    | No se envía token                 | `Token no proporcionado`         |
| 403    | Usuario no admin                  | Acceso denegado                  |
| 404    | Cuestionario no encontrado        | Mensaje de recurso no encontrado |
| 500    | Error interno                     | Mensaje de error interno         |

---