# Cambios en AdminPage: gestión de usuarios

Se agregó gestión real de cuentas desde el panel de administración.

## Frontend

Archivos modificados:

```txt
frontend/src/features/admin/pages/AdminPage.tsx
frontend/src/features/admin/hooks/useAdminDashboard.ts
frontend/src/features/admin/components/UserRow.tsx
frontend/src/features/admin/components/UserRow.css
```

Cambios:

- Se eliminó el botón del ojo porque no tenía funcionalidad.
- Se agregó edición de usuario desde un modal.
- Se permite editar nombre, correo, región, comuna, estatus y tipo de usuario.
- Se agregó eliminación de usuarios con confirmación.
- Se muestra progreso de cuestionarios respondidos por usuario.
- El riesgo ahora se calcula desde datos reales del backend.

## Backend

Archivos modificados:

```txt
backend/src/modules/auth/auth.routes.ts
backend/src/modules/auth/auth.controller.ts
```

Endpoints agregados:

```txt
PUT /api/auth/users/:id
DELETE /api/auth/users/:id
```

El listado de usuarios ahora incluye:

```txt
cuestionariosRespondidos
totalCuestionarios
riesgo
colorRiesgo
```

## Regla de riesgo

El riesgo se calcula por intervalos según el total de cuestionarios:

- Menos de 1/3 respondidos: ALTO.
- Desde 1/3 respondidos: MEDIO.
- Desde 2/3 respondidos: BAJO.

Ejemplo con 9 cuestionarios:

```txt
0, 1 o 2 respondidos -> ALTO
3, 4 o 5 respondidos -> MEDIO
6, 7, 8 o 9 respondidos -> BAJO
```
