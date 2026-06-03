# Configuración de variables de entorno

El proyecto usa **un solo archivo `.env` compartido** para frontend y backend:

```txt
config/.env
```

No subas ese archivo real a GitHub. Sí puedes subir el ejemplo:

```txt
config/.env.example
```

## Crear el `.env`

Desde la raíz del proyecto:

```powershell
Copy-Item config/.env.example config/.env
```

Luego edita `config/.env` con tus credenciales reales.

## Variables privadas del backend

Estas variables solo las debe usar el backend:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
JWT_SECRET=una_clave_segura
PORT=3000
```

El backend las carga desde `backend/src/config/env.ts`.

## Variables públicas del frontend

El frontend solo puede leer variables que comienzan con `VITE_`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Vite está configurado en `frontend/vite.config.ts` para leer el `.env` desde `config/.env`.

## Importante

Nunca pongas `SUPABASE_SERVICE_ROLE_KEY` ni `JWT_SECRET` con prefijo `VITE_`, porque esas variables quedarían expuestas al navegador.
