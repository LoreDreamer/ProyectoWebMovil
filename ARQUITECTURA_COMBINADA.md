# Arquitectura combinada aplicada

Se reorganizó el proyecto usando una combinación de:

1. **Screaming Architecture**: las carpetas principales muestran qué hace la aplicación.
2. **Organización por funcionalidad**: cada módulo contiene sus propias páginas, componentes, hooks, servicios y tipos.

## Frontend

La estructura objetivo quedó así:

```txt
frontend/src/
├── app/                  # Router, menú y rutas protegidas
├── shared/               # API client, layout reutilizable y piezas compartidas
├── features/             # Funcionalidades principales del sistema
│   ├── auth/
│   ├── home/
│   ├── dashboard/
│   ├── admin/
│   ├── alerts/
│   ├── complaints/
│   ├── education/
│   ├── questionnaires/
│   ├── protocols/
│   └── activities/
├── assets/
├── context/
├── theme/
└── main.tsx
```

Ejemplo de módulo:

```txt
features/questionnaires/
├── pages/
├── components/
├── hooks/
├── admin/
└── index.ts
```

También se agregó alias de imports:

```ts
@/features/questionnaires
@/shared/api/apiClient
@/context/AuthContext
```

Esto evita imports largos como `../../../shared/api/apiClient`.

## Backend

La estructura objetivo quedó así:

```txt
backend/src/
├── app.ts
├── server.ts
├── config/
├── middlewares/
├── routes/
├── shared/
├── services/
└── modules/
    ├── auth/
    ├── alerts/
    ├── complaints/
    ├── education/
    ├── questionnaires/
    ├── protocols/
    ├── activities/
    └── subscriptions/
```

Cada módulo contiene sus rutas y controlador correspondiente:

```txt
modules/questionnaires/
├── questionnaires.routes.ts
├── questionnaires.controller.ts
└── index.ts
```

## Compatibilidad temporal

Se dejaron archivos wrapper en las rutas antiguas, por ejemplo:

```txt
frontend/src/pages/index.ts
frontend/src/components/index.ts
backend/controllers/*.ts
backend/routes/*.ts
```

Estos archivos existen solo para evitar romper imports antiguos mientras se termina la migración completa.

## Siguiente paso recomendado

La arquitectura ya está combinada y más ordenada. El siguiente paso sería refactorizar internamente los archivos grandes:

```txt
QuestionnairesPanel.tsx
EducationPanel.tsx
AlertsPanel.tsx
QuestionnairesController.ts
EducationController.ts
```

Separándolos en:

```txt
controller → service → repository
page → hook → service → component
```
