# Cambios de arquitectura aplicados

Este ZIP contiene una refactorización incremental de arquitectura. La idea fue mejorar el orden del proyecto sin reescribir toda la lógica funcional de una sola vez.

## Backend

Nueva entrada principal:

```txt
backend/src/server.ts
backend/src/app.ts
backend/src/routes/index.ts
```

La estructura nueva queda preparada así:

```txt
backend/src/
├── app.ts
├── server.ts
├── config/
├── middlewares/
├── routes/
├── shared/
└── modules/
    ├── activities/
    ├── alerts/
    ├── auth/
    ├── complaints/
    ├── education/
    ├── protocols/
    ├── questionnaires/
    └── subscriptions/
```

Cambios importantes:

- `backend/server.ts` quedó como entrada de compatibilidad y ahora delega en `backend/src/server.ts`.
- `backend/package.json` ahora ejecuta `tsx watch src/server.ts`.
- `scripts/dev.mjs` ahora levanta el backend desde `src/server.ts`.
- Se corrigió el montaje de `/api/subscriptions`, que antes estaba importando por error las rutas de cuestionarios.
- Se agregó `backend/src/app.ts` para separar configuración de Express del arranque del servidor.
- Se agregó `backend/src/routes/index.ts` para centralizar rutas API.
- Se agregaron middlewares base de error y `ApiError`.
- Se movió `nodemailer` al `backend/package.json`, porque es dependencia del backend, no de la raíz.

## Frontend

Nueva estructura agregada:

```txt
frontend/src/app/
├── AppMenu.tsx
├── AppRoutes.tsx
└── ProtectedRoute.tsx

frontend/src/shared/api/
├── apiClient.ts
└── index.ts

frontend/src/features/
├── admin/
│   └── hooks/
├── alerts/
│   └── hooks/
└── questionnaires/
    └── hooks/
```

Cambios importantes:

- `frontend/src/App.tsx` quedó más limpio: solo inicializa Ionic, importa estilos globales y monta `AuthProvider` + `AppRoutes`.
- Se separó el menú lateral en `frontend/src/app/AppMenu.tsx`.
- Se separaron las rutas protegidas en `frontend/src/app/ProtectedRoute.tsx`.
- Se centralizó la URL del backend en `frontend/src/shared/api/apiClient.ts`.
- Se eliminaron constantes repetidas tipo `const API_URL = 'http://localhost:3000'` en los archivos del frontend.
- Se agregaron hooks para sacar lógica de componentes:
  - `useAdminDashboard`
  - `useActivityAdmin`
  - `usePublicAlerts`
  - `useCybersecurityProgress`
- `AdminPage.tsx`, `ActivityPanel.tsx`, `NewsPart.tsx` y `Progress.tsx` quedaron más limpios, delegando carga de datos y `useEffect` a hooks.

## Pendiente recomendado

Todavía quedan paneles grandes que conviene dividir en una segunda refactorización:

```txt
frontend/src/components/adminPanel/questionnairesPanel.tsx
frontend/src/components/adminPanel/educationPanel.tsx
frontend/src/components/adminPanel/alertsPanel.tsx
frontend/src/components/adminPanel/protocolsPanel.tsx
```

La recomendación es convertir cada uno en:

```txt
features/<modulo>/admin/
├── <Modulo>AdminPage.tsx
├── <Modulo>Form.tsx
├── <Modulo>Table.tsx
├── use<Modulo>Admin.ts
└── <modulo>.admin.service.ts
```

No los dividí completamente en esta pasada para evitar romper funcionalidades grandes como formularios con archivos, imágenes, CSV y edición.
