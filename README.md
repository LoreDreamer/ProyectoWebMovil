# Plataforma Municipal de Ciberseguridad

Aplicación web municipal orientada a la educación, prevención, diagnóstico y gestión de riesgos de ciberseguridad para usuarios de la comunidad. El sistema permite acceder a módulos educativos, cuestionarios, protocolos, alertas, denuncias y un panel administrativo para gestionar usuarios y contenidos.

El proyecto está construido con **Ionic React + TypeScript** en el frontend y **Node.js + Express + TypeScript** en el backend, utilizando **Supabase/PostgreSQL** como base de datos y almacenamiento de archivos.

---

## Tabla de contenidos

1. [Descripción general del proyecto](#descripción-general-del-proyecto)
2. [Justificación del problema](#justificación-del-problema)
3. [Usuario objetivo](#usuario-objetivo)
4. [Integrantes](#integrantes)
5. [Tecnologías utilizadas](#tecnologías-utilizadas)
6. [Estructura del proyecto](#estructura-del-proyecto)
7. [Guía de instalación y ejecución](#guía-de-instalación-y-ejecución)
8. [Variables de entorno](#variables-de-entorno)
9. [Roles del sistema](#roles-del-sistema)
10. [Credenciales de prueba](#credenciales-de-prueba)
11. [Requerimientos funcionales](#requerimientos-funcionales)
12. [Requerimientos no funcionales](#requerimientos-no-funcionales)
13. [Arquitectura general de navegación](#arquitectura-general-de-navegación)
14. [Rutas principales del frontend](#rutas-principales-del-frontend)
15. [Rutas principales del backend](#rutas-principales-del-backend)
16. [Jerarquía de vistas](#jerarquía-de-vistas)
17. [Flujo de navegación](#flujo-de-navegación)
18. [Diferenciación de acceso según roles](#diferenciación-de-acceso-según-roles)
19. [Gestión administrativa](#gestión-administrativa)
20. [Notas de seguridad](#notas-de-seguridad)

---

## Descripción general del proyecto

La **Plataforma Municipal de Ciberseguridad** es una solución web enfocada en apoyar a la comunidad en el aprendizaje y prevención de riesgos digitales. La plataforma centraliza información educativa, alertas, protocolos de actuación, cuestionarios de diagnóstico y formularios de denuncia.

El sistema contempla dos tipos de usuarios:

- **Usuario general:** puede revisar contenidos, responder cuestionarios, consultar protocolos, ver alertas y realizar denuncias.
- **Administrador:** puede acceder a un panel de gestión para administrar usuarios, actividades, alertas, protocolos, educación y cuestionarios.

El objetivo principal es entregar una herramienta clara, accesible y organizada que permita mejorar la cultura de ciberseguridad en el contexto municipal.

---

## Justificación del problema

La digitalización de trámites, servicios y comunicaciones municipales ha aumentado la exposición de los ciudadanos a riesgos de ciberseguridad, tales como:

- Correos fraudulentos o phishing.
- Robo de información personal.
- Suplantación de identidad.
- Uso inseguro de contraseñas.
- Desconocimiento de protocolos ante incidentes digitales.
- Baja educación digital en sectores de la comunidad.

En muchos casos, las personas no cuentan con conocimientos suficientes para identificar amenazas o reaccionar correctamente frente a un incidente. Por esto, la plataforma busca entregar una solución preventiva, educativa y de apoyo, permitiendo que el municipio centralice recursos de ciberseguridad y que los usuarios puedan acceder a ellos de forma simple.

---

## Usuario objetivo

### Usuario general

Persona de la comunidad que necesita informarse, capacitarse o reportar situaciones relacionadas con ciberseguridad.

**Necesidades principales:**

- Acceso rápido a información confiable.
- Lenguaje claro y comprensible.
- Formularios simples.
- Navegación intuitiva.
- Acceso desde computador o dispositivo móvil.

**Acciones esperadas:**

- Revisar alertas y noticias.
- Acceder a módulos educativos.
- Responder cuestionarios de diagnóstico.
- Consultar protocolos de actuación.
- Realizar denuncias o reportes.

### Administrador

Funcionario o encargado de la gestión de contenidos y usuarios dentro de la plataforma.

**Necesidades principales:**

- Gestionar usuarios del sistema.
- Crear, editar o eliminar contenidos.
- Revisar datos generales de la plataforma.
- Identificar niveles de riesgo de los usuarios.
- Mantener actualizada la información disponible.

---

## Integrantes

- Lucas Contreras
- Eduardo Cordero
- Constanza Suárez

---

## Tecnologías utilizadas

### Frontend

- Ionic React
- React
- TypeScript
- Vite
- React Router
- CSS modular/global por secciones

### Backend

- Node.js
- Express
- TypeScript
- JWT para autenticación
- Multer para manejo de archivos
- BcryptJS para contraseñas
- Nodemailer para notificaciones por correo

### Base de datos y servicios

- Supabase
- PostgreSQL
- Supabase Storage

---

## Estructura del proyecto

El proyecto utiliza una arquitectura combinada basada en **organización por funcionalidad** y **arquitectura explícita**, donde las carpetas principales representan módulos reales del sistema.

```txt
ProyectoWebMovil/
├── backend/
│   ├── src/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   ├── config/
│   │   │   ├── env.ts
│   │   │   ├── jwt.config.ts
│   │   │   └── supabase.ts
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── upload.middleware.ts
│   │   │   └── uploadProtocol.middleware.ts
│   │   ├── modules/
│   │   │   ├── activities/
│   │   │   ├── alerts/
│   │   │   ├── auth/
│   │   │   ├── complaints/
│   │   │   ├── education/
│   │   │   ├── protocols/
│   │   │   ├── questionnaires/
│   │   │   └── subscriptions/
│   │   ├── routes/
│   │   │   └── index.ts
│   │   ├── services/
│   │   └── shared/
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── AppMenu.tsx
│   │   │   ├── AppRoutes.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── assets/
│   │   │   ├── data/
│   │   │   │   └── chileRegions.ts
│   │   │   ├── logos/
│   │   │   ├── news/
│   │   │   └── questions/
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── features/
│   │   │   ├── activities/
│   │   │   ├── admin/
│   │   │   ├── alerts/
│   │   │   ├── auth/
│   │   │   ├── complaints/
│   │   │   ├── dashboard/
│   │   │   ├── education/
│   │   │   ├── home/
│   │   │   ├── protocols/
│   │   │   └── questionnaires/
│   │   ├── shared/
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   └── utils/
│   │   ├── theme/
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── config/
│   └── .env.example
│
├── scripts/
│   └── dev.mjs
│
├── package.json
├── tsconfig.json
└── README.md
```

### Criterio de organización

- `features/`: agrupa las funcionalidades principales del frontend.
- `modules/`: agrupa las funcionalidades principales del backend.
- `shared/`: contiene utilidades, componentes o funciones reutilizables.
- `config/`: centraliza la configuración del entorno.
- `app/`: contiene configuración general de navegación y estructura principal del frontend.

---

## Guía de instalación y ejecución

El proyecto puede ejecutarse de varias formas, dependiendo de si se desea levantar **frontend + backend juntos** o cada parte por separado.

### 1. Clonar el repositorio

```bash
git clone https://github.com/LoreDreamer/ProyectoWebMovil.git
cd ProyectoWebMovil
```

### 2. Instalar dependencias

#### Opción recomendada: instalar frontend y backend juntos

Desde la raíz del proyecto:

```bash
npm run setup
```

Este comando ejecuta internamente:

```bash
npm --prefix frontend install
npm --prefix backend install
```

#### Opción alternativa: instalar por separado

Frontend:

```bash
cd frontend
npm install
```

Backend:

```bash
cd backend
npm install
```

También se puede hacer desde la raíz sin entrar a cada carpeta:

```bash
npm --prefix frontend install
npm --prefix backend install
```

### 3. Configurar variables de entorno

El proyecto usa un único archivo de variables de entorno compartido:

```txt
config/.env
```

Crear el archivo real a partir del ejemplo.

En Windows CMD o PowerShell:

```bash
copy config\.env.example config\.env
```

En Linux/macOS:

```bash
cp config/.env.example config/.env
```

Luego editar `config/.env` con las credenciales reales de Supabase, JWT y configuración local.

### 4. Ejecutar frontend y backend juntos

Desde la raíz del proyecto se puede usar cualquiera de estos comandos:

```bash
npm run dev
```

O también:

```bash
npm start
```

Ambos comandos ejecutan el script:

```bash
node scripts/dev.mjs
```

Este script levanta:

| Servicio | URL local | Descripción |
|---|---|---|
| Frontend | `http://localhost:5173` | Aplicación Ionic React |
| Backend | `http://localhost:3000` | API REST con Express |

Esta es la forma recomendada para probar la plataforma completa durante el desarrollo.

### 5. Ejecutar solo el frontend

Desde la raíz del proyecto:

```bash
npm run f
```

Este comando ejecuta internamente:

```bash
npm --prefix frontend run dev
```

También se puede ejecutar entrando a la carpeta del frontend:

```bash
cd frontend
npm run dev
```

El frontend queda disponible en:

```txt
http://localhost:5173
```

### 6. Ejecutar solo el backend

Desde la raíz del proyecto:

```bash
npm run b
```

Este comando ejecuta internamente:

```bash
npm --prefix backend run dev
```

También se puede ejecutar entrando a la carpeta del backend:

```bash
cd backend
npm run dev
```

El backend queda disponible en:

```txt
http://localhost:3000
```

### 7. Ejecutar backend en modo start

Dentro de la carpeta `backend` también existe el comando:

```bash
npm start
```

Este ejecuta:

```bash
tsx src/server.ts
```

A diferencia de `npm run dev`, este comando no queda observando cambios con `watch`.

### 8. Compilar el frontend

Desde la raíz del proyecto:

```bash
npm run build
```

Este comando ejecuta internamente:

```bash
npm --prefix frontend run build
```

También se puede ejecutar directamente desde el frontend:

```bash
cd frontend
npm run build
```

El resultado de compilación se genera en:

```txt
frontend/dist/
```

### 9. Previsualizar el build del frontend

Después de compilar el frontend, se puede previsualizar con:

```bash
cd frontend
npm run preview
```

Este comando sirve para revisar localmente la versión compilada.

### 10. Validar TypeScript del backend

Para revisar que el backend no tenga errores de TypeScript:

```bash
cd backend
npx tsc --noEmit
```

### 11. Resumen de comandos principales

| Comando | Ubicación | Función |
|---|---|---|
| `npm run setup` | Raíz | Instala dependencias de frontend y backend. |
| `npm run dev` | Raíz | Ejecuta frontend + backend juntos. |
| `npm start` | Raíz | Ejecuta frontend + backend juntos. |
| `npm run f` | Raíz | Ejecuta solo el frontend. |
| `npm run b` | Raíz | Ejecuta solo el backend. |
| `npm run build` | Raíz | Compila el frontend. |
| `npm --prefix frontend install` | Raíz | Instala solo dependencias del frontend. |
| `npm --prefix backend install` | Raíz | Instala solo dependencias del backend. |
| `npm --prefix frontend run dev` | Raíz | Ejecuta solo el frontend desde la raíz. |
| `npm --prefix backend run dev` | Raíz | Ejecuta solo el backend desde la raíz. |
| `cd frontend && npm run preview` | Frontend | Previsualiza el build del frontend. |
| `cd backend && npx tsc --noEmit` | Backend | Valida TypeScript del backend. |

### 12. Flujo recomendado para ejecutar por primera vez

```bash
npm run setup
copy config\.env.example config\.env
npm run dev
```

En Linux/macOS:

```bash
npm run setup
cp config/.env.example config/.env
npm run dev
```

### 13. Flujo recomendado para validar antes de entregar

```bash
npm run setup
npm run build
cd backend
npx tsc --noEmit
```

Si ambos comandos finalizan sin errores, el frontend compila correctamente y el backend no presenta errores de TypeScript.

---

## Variables de entorno

El proyecto utiliza **un solo archivo `.env` compartido**, ubicado en:

```txt
config/.env
```

Ejemplo de configuración:

```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

JWT_SECRET=coloca_una_clave_larga_y_segura

SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
SUPABASE_STORAGE_BUCKET=municipal-files

SUPABASE_USERS_TABLE=usuario
SUPABASE_ALERTS_TABLE=alertas
SUPABASE_DENUNCIAS_TABLE=denuncia
SUPABASE_PROTOCOLOS_TABLE=protocolo
SUPABASE_ACTIVIDADES_TABLE=actividad
SUPABASE_EDUCATION_TABLE=educacion
SUPABASE_QUESTIONNAIRES_TABLE=cuestionario

VITE_API_BASE_URL=http://localhost:3000
```

---

## Roles del sistema

### Usuario

Puede acceder a las secciones públicas y protegidas destinadas a la comunidad:

- Inicio de usuario.
- Educación.
- Cuestionarios.
- Denuncias.
- Protocolos.
- Alertas.
- Perfil y configuración.

### Administrador

Puede acceder al panel administrativo y gestionar información del sistema:

- Gestión de usuarios.
- Gestión de cuestionarios.
- Gestión de educación.
- Gestión de protocolos.
- Gestión de alertas.
- Gestión de actividades.
- Revisión general de datos administrativos.

---

## Credenciales de prueba

Las siguientes cuentas son de prueba/desarrollo. Todas usan la contraseña:

```txt
1234
```

| Correo | Rol esperado |
|---|---|
| `daniel@user.com` | Usuario |
| `fernanda.gonzalez@correo.com` | Usuario |
| `javier.munoz@correo.com` | Usuario |
| `sofia.soto@correo.com` | Usuario |
| `lucas@admin.com` | Administrador |
| `camila.rojas@correo.com` | Usuario |
| `eduardo.cordero@mail.pucv.cl` | Usuario |
| `cony@admin.com` | Administrador |
| `matias.perez@correo.com` | Usuario |

> Nota: estas credenciales son solo para pruebas locales o académicas. No deben utilizarse en producción.

---

## Requerimientos funcionales

### RF1. Registro e inicio de sesión

El sistema debe permitir que los usuarios se registren e inicien sesión mediante correo y contraseña.

### RF2. Control de sesión

El sistema debe mantener la sesión del usuario mediante token y permitir cerrar sesión.

### RF3. Diferenciación de roles

El sistema debe diferenciar entre usuarios generales y administradores para restringir funcionalidades sensibles.

### RF4. Visualización de inicio público

El sistema debe mostrar una página inicial con información general de la plataforma y accesos principales.

### RF5. Visualización de inicio de usuario

El usuario autenticado debe poder acceder a un inicio personalizado con actividades y accesos relevantes.

### RF6. Visualización de educación

El sistema debe permitir revisar módulos o contenidos educativos relacionados con ciberseguridad.

### RF7. Visualización de módulos educativos

El usuario debe poder acceder al detalle de un módulo educativo específico.

### RF8. Gestión de cuestionarios

El sistema debe permitir visualizar cuestionarios disponibles y responderlos.

### RF9. Resolución de cuestionarios

El usuario debe poder responder preguntas y registrar su avance.

### RF10. Cálculo de riesgo por cuestionarios

El sistema debe calcular el riesgo del usuario según la cantidad de cuestionarios respondidos:

- Riesgo alto: menos de un tercio de cuestionarios respondidos.
- Riesgo medio: desde un tercio hasta antes de dos tercios.
- Riesgo bajo: desde dos tercios o más.

Ejemplo con 9 cuestionarios:

| Cuestionarios respondidos | Riesgo |
|---:|---|
| 0, 1 o 2 | Alto |
| 3, 4 o 5 | Medio |
| 6, 7, 8 o 9 | Bajo |

### RF11. Denuncias

El sistema debe permitir que los usuarios envíen denuncias o reportes de incidentes de ciberseguridad.

### RF12. Protocolos

El sistema debe permitir consultar protocolos de actuación o documentos relacionados con ciberseguridad.

### RF13. Alertas

El sistema debe mostrar alertas o noticias relevantes sobre ciberseguridad.

### RF14. Suscripciones

El sistema debe permitir registrar correos para suscripciones o notificaciones informativas.

### RF15. Panel administrativo

El sistema debe permitir que los administradores accedan a una vista de gestión interna.

### RF16. Gestión de usuarios

El administrador debe poder editar o eliminar cuentas de usuario. Los campos editables son:

- Nombre.
- Correo.
- Región.
- Comuna.
- Estatus.
- Tipo de usuario.

### RF17. Gestión de contenidos

El administrador debe poder crear, editar o eliminar contenidos asociados a cuestionarios, educación, protocolos, alertas y actividades.

---

## Requerimientos no funcionales

### RNF1. Seguridad

El sistema debe proteger las rutas administrativas mediante autenticación y validación de rol.

### RNF2. Privacidad de credenciales

Las credenciales privadas deben mantenerse en `config/.env` y no subirse al repositorio.

### RNF3. Usabilidad

La interfaz debe ser clara, consistente y fácil de utilizar para usuarios con distintos niveles de conocimiento digital.

### RNF4. Diseño responsive

La plataforma debe adaptarse a escritorio y dispositivos móviles.

### RNF5. Mantenibilidad

El código debe organizarse por funcionalidades para facilitar cambios futuros.

### RNF6. Escalabilidad

La arquitectura debe permitir agregar nuevas funcionalidades sin afectar directamente otros módulos.

### RNF7. Rendimiento

Las vistas deben cargar de manera fluida y consumir la API de forma ordenada.

### RNF8. Compatibilidad

El sistema debe funcionar correctamente en navegadores modernos.

### RNF9. Consistencia visual

Los formularios, botones, tarjetas y paneles deben mantener un estilo visual coherente.

---

## Arquitectura general de navegación

La navegación está centralizada en:

```txt
frontend/src/app/AppRoutes.tsx
```

El menú lateral y la estructura principal de navegación se encuentran en:

```txt
frontend/src/app/AppMenu.tsx
```

La protección de rutas se gestiona mediante:

```txt
frontend/src/app/ProtectedRoute.tsx
```

El flujo general es:

```txt
Usuario entra a la app
        │
        ▼
Página pública Home
        │
        ├── Login
        ├── Registro
        ├── Educación pública
        ├── Denuncias
        └── Alertas
        │
        ▼
Usuario autenticado
        │
        ├── Inicio
        ├── Cuestionarios
        ├── Protocolos
        ├── Perfil
        └── Configuración
        │
        ▼
Administrador
        │
        └── Panel administrativo
```

---

## Rutas principales del frontend

| Ruta | Vista | Acceso |
|---|---|---|
| `/` | HomePage | Público |
| `/index` | HomePage | Público |
| `/login` | LoginPage | Público |
| `/register` | RegisterPage | Público |
| `/educacion` | EducationPage | Público |
| `/denuncias` | ComplaintsPage | Público |
| `/alertas` | NewsPage | Público |
| `/inicio` | InicioPage | Usuario autenticado |
| `/cuestionarios` | QuestionnairePage | Usuario autenticado |
| `/cuestionarios/:id/resolver` | QuestionnaireTakePage | Usuario autenticado |
| `/educacion/modulo/:id` | EducationModulePage | Usuario autenticado |
| `/protocolos` | ProtocolsPage | Usuario autenticado |
| `/admin` | AdminPage | Administrador |
| `/perfil` | PlaceholderPage | Usuario autenticado |
| `/configuracion` | PlaceholderPage | Usuario autenticado |

---

## Rutas secundarias del frontend

Las rutas secundarias corresponden a vistas de detalle, resolución o páginas protegidas que dependen de una ruta principal:

| Ruta secundaria | Descripción |
|---|---|
| `/educacion/modulo/:id` | Muestra el detalle de un módulo educativo. |
| `/cuestionarios/:id/resolver` | Permite resolver un cuestionario específico. |
| `/perfil` | Vista reservada para datos del usuario. |
| `/configuracion` | Vista reservada para configuración del usuario. |

---

## Rutas principales del backend

Las rutas del backend se montan desde:

```txt
backend/src/routes/index.ts
```

| Ruta base | Módulo | Descripción |
|---|---|---|
| `/api/auth` | Auth | Registro, login, sesión y usuarios. |
| `/api/alerts` | Alerts | Gestión y visualización de alertas. |
| `/api/denuncias` | Complaints | Registro y consulta de denuncias. |
| `/api/protocolos` | Protocols | Gestión y visualización de protocolos. |
| `/api/activities` | Activities | Gestión y visualización de actividades. |
| `/api/education` | Education | Gestión y visualización de contenidos educativos. |
| `/api/questionnaires` | Questionnaires | Gestión, resolución y progreso de cuestionarios. |
| `/api/subscriptions` | Subscriptions | Registro de suscripciones. |

---

## Rutas secundarias del backend

### Auth

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | Público | Registra un nuevo usuario. |
| POST | `/api/auth/login` | Público | Inicia sesión. |
| GET | `/api/auth/me` | Autenticado | Obtiene datos del usuario actual. |
| GET | `/api/auth/users` | Administrador | Lista usuarios. |
| PUT | `/api/auth/users/:id` | Administrador | Edita un usuario. |
| DELETE | `/api/auth/users/:id` | Administrador | Elimina un usuario. |

### Cuestionarios

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/questionnaires` | Público/usuario | Lista cuestionarios. |
| GET | `/api/questionnaires/progress/me` | Autenticado | Obtiene progreso personal. |
| GET | `/api/questionnaires/:id/resolver` | Autenticado | Obtiene cuestionario para resolver. |
| POST | `/api/questionnaires/:id/responder` | Autenticado | Registra respuesta. |
| POST | `/api/questionnaires/:id/complete` | Autenticado | Completa cuestionario. |

### Módulos de contenido

| Ruta | Uso general |
|---|---|
| `/api/activities` | Actividades visibles en inicio y panel admin. |
| `/api/alerts` | Alertas/noticias de ciberseguridad. |
| `/api/education` | Contenido educativo. |
| `/api/protocolos` | Protocolos/documentos de actuación. |
| `/api/denuncias` | Denuncias o reportes. |
| `/api/subscriptions` | Suscripción por correo. |

---

## Jerarquía de vistas

```txt
AppRoutes
├── HomePage
├── LoginPage
├── RegisterPage
├── EducationPage
│   └── EducationModulePage
├── ComplaintsPage
├── NewsPage
├── InicioPage
├── QuestionnairePage
│   └── QuestionnaireTakePage
├── ProtocolsPage
├── AdminPage
│   ├── Gestión de usuarios
│   ├── Gestión de cuestionarios
│   ├── Gestión de educación
│   ├── Gestión de protocolos
│   ├── Gestión de alertas
│   └── Gestión de actividades
├── Perfil
└── Configuración
```

---

## Flujo de navegación

### Flujo de usuario general

```txt
Home
 ├── Registro
 ├── Login
 │    └── Inicio
 │         ├── Educación
 │         │    └── Módulo educativo
 │         ├── Cuestionarios
 │         │    └── Resolver cuestionario
 │         ├── Protocolos
 │         ├── Alertas
 │         └── Denuncias
```

### Flujo de administrador

```txt
Login
 └── Inicio de sesión como administrador
      └── Panel administrativo
           ├── Usuarios
           ├── Cuestionarios
           ├── Educación
           ├── Protocolos
           ├── Alertas
           └── Actividades
```

---

## Diferenciación de acceso según roles

La diferenciación se realiza mediante autenticación JWT y validación de rol.

### Frontend

El frontend utiliza `ProtectedRoute` para bloquear rutas que requieren sesión o rol administrador.

```txt
frontend/src/app/ProtectedRoute.tsx
```

Ejemplo de rutas protegidas:

- `/inicio`
- `/cuestionarios`
- `/protocolos`
- `/admin`

La ruta `/admin` requiere rol de administrador.

### Backend

El backend utiliza middlewares de autenticación y autorización:

```txt
backend/src/middlewares/auth.middleware.ts
```

Middlewares principales:

- `authenticateToken`: valida que exista un token válido.
- `requireAdmin`: valida que el usuario tenga rol administrador.

---

## Gestión administrativa

El panel administrativo permite gestionar diferentes recursos del sistema.

### Usuarios

El administrador puede:

- Ver usuarios registrados.
- Editar nombre, correo, región, comuna, estatus y tipo de usuario.
- Eliminar usuarios.
- Revisar el nivel de riesgo de cada usuario.

### Riesgo de usuario

El riesgo se calcula en función de la cantidad de cuestionarios respondidos respecto al total disponible.

```txt
0% a menos de 33%     → Riesgo alto
33% a menos de 66%    → Riesgo medio
66% a 100%            → Riesgo bajo
```

### Región y comuna

Los formularios utilizan un archivo TypeScript con regiones y comunas de Chile:

```txt
frontend/src/assets/data/chileRegions.ts
```

Esto evita escribir manualmente región y comuna, reduciendo errores de digitación.

---

## Notas de seguridad

- No subir `config/.env` al repositorio.
- No exponer `SUPABASE_SERVICE_ROLE_KEY` en el frontend.
- No usar contraseñas de prueba en producción.
- Cambiar `JWT_SECRET` antes de desplegar.
- Validar permisos administrativos tanto en frontend como en backend.
- Mantener activas las reglas de seguridad correspondientes en Supabase.

---

## Comandos útiles

| Comando | Ubicación | Descripción |
|---|---|---|
| `npm run setup` | Raíz | Instala dependencias de frontend y backend. |
| `npm run dev` | Raíz | Ejecuta frontend + backend juntos. |
| `npm start` | Raíz | Ejecuta frontend + backend juntos. |
| `npm run f` | Raíz | Ejecuta solo el frontend. |
| `npm run b` | Raíz | Ejecuta solo el backend. |
| `npm run build` | Raíz | Compila el frontend. |
| `npm --prefix frontend install` | Raíz | Instala dependencias del frontend. |
| `npm --prefix backend install` | Raíz | Instala dependencias del backend. |
| `npm --prefix frontend run dev` | Raíz | Ejecuta el frontend desde la raíz. |
| `npm --prefix backend run dev` | Raíz | Ejecuta el backend desde la raíz. |
| `cd frontend && npm run preview` | Frontend | Previsualiza la versión compilada del frontend. |
| `cd backend && npx tsc --noEmit` | Backend | Valida errores de TypeScript en backend. |

Puertos utilizados por defecto:

| Servicio | Puerto | URL |
|---|---:|---|
| Frontend | 5173 | `http://localhost:5173` |
| Backend | 3000 | `http://localhost:3000` |

---

## Estado del proyecto

El proyecto cuenta con una arquitectura modular por funcionalidades, separación entre frontend y backend, configuración centralizada de variables de entorno, rutas protegidas por rol y panel administrativo para gestionar usuarios y contenidos principales.
