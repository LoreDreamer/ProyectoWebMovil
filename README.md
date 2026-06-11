# Plataforma Municipal de Ciberseguridad

Aplicación web municipal orientada a la **educación, prevención, diagnóstico y gestión de riesgos de ciberseguridad** para usuarios de la comunidad. La plataforma permite acceder a contenidos educativos, cuestionarios, protocolos, alertas, denuncias y herramientas preventivas de seguridad, además de un panel administrativo para gestionar usuarios y contenidos.

El proyecto está desarrollado con **Ionic React + TypeScript** en el frontend y **Node.js + Express + TypeScript** en el backend. Utiliza **Supabase/PostgreSQL** como base de datos, **Supabase Storage** para archivos, **Google Safe Browsing API** como servicio externo y **Docker Compose** para levantar la plataforma completa en contenedores.

---

## Integrantes

- Lucas Contreras
- Eduardo Cordero
- Constanza Suárez

---

## Tabla de contenidos

1. [Descripción general](#descripción-general)
2. [Justificación del problema](#justificación-del-problema)
3. [Usuario objetivo](#usuario-objetivo)
4. [Tecnologías utilizadas](#tecnologías-utilizadas)
5. [Estructura del proyecto](#estructura-del-proyecto)
6. [Instalación y ejecución local](#instalación-y-ejecución-local)
7. [Variables de entorno](#variables-de-entorno)
8. [Ejecución con Docker](#ejecución-con-docker)
9. [Roles del sistema](#roles-del-sistema)
10. [Credenciales de prueba](#credenciales-de-prueba)
11. [Requerimientos funcionales](#requerimientos-funcionales)
12. [Requerimientos no funcionales](#requerimientos-no-funcionales)
13. [Base de datos y modelo relacional](#base-de-datos-y-modelo-relacional)
14. [Rutas principales del frontend](#rutas-principales-del-frontend)
15. [Rutas principales del backend](#rutas-principales-del-backend)
16. [Endpoints y pruebas funcionales](#endpoints-y-pruebas-funcionales)
17. [Arquitectura de navegación](#arquitectura-de-navegación)
18. [Gestión administrativa](#gestión-administrativa)
19. [Servicio externo EF5](#servicio-externo-ef5)
20. [Cumplimiento de entrega final](#cumplimiento-de-entrega-final)
21. [Comandos útiles](#comandos-útiles)
22. [Notas de seguridad](#notas-de-seguridad)

---

## Descripción general

La **Plataforma Municipal de Ciberseguridad** busca apoyar a la comunidad en la prevención de amenazas digitales mediante información educativa, protocolos de actuación, cuestionarios de diagnóstico, alertas y herramientas de análisis preventivo.

El sistema contempla dos perfiles principales:

- **Usuario general:** puede revisar contenidos, responder cuestionarios, consultar protocolos, ver alertas, enviar denuncias y utilizar herramientas preventivas.
- **Administrador:** puede acceder al panel administrativo para gestionar usuarios, actividades, alertas, protocolos, educación, cuestionarios y denuncias.

El objetivo principal es entregar una herramienta clara, accesible y organizada que permita mejorar la cultura de ciberseguridad dentro de un contexto municipal.

---

## Justificación del problema

La digitalización de trámites, servicios y comunicaciones municipales ha aumentado la exposición de los ciudadanos a riesgos de ciberseguridad, tales como:

- Correos fraudulentos o phishing.
- Robo de información personal.
- Suplantación de identidad.
- Uso inseguro de contraseñas.
- Enlaces maliciosos.
- Desconocimiento de protocolos ante incidentes digitales.
- Baja educación digital en sectores de la comunidad.

En muchos casos, las personas no cuentan con conocimientos suficientes para identificar amenazas o reaccionar correctamente frente a un incidente. Por esto, la plataforma entrega una solución preventiva, educativa y de apoyo, permitiendo que el municipio centralice recursos de ciberseguridad y los usuarios accedan a ellos de forma simple.

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
- Analizar enlaces sospechosos.

### Administrador

Funcionario o encargado de la gestión de contenidos y usuarios dentro de la plataforma.

**Necesidades principales:**

- Gestionar usuarios del sistema.
- Crear, editar o eliminar contenidos.
- Revisar denuncias enviadas por usuarios.
- Identificar niveles de riesgo de los usuarios.
- Mantener actualizada la información disponible.

---

## Tecnologías utilizadas

### Frontend

- Ionic React
- React
- TypeScript
- Vite
- React Router
- CSS organizado por secciones y responsive global
- DOMPurify para sanitización de contenido HTML

### Backend

- Node.js
- Express
- TypeScript
- JWT para autenticación
- BcryptJS para contraseñas
- Multer para manejo de archivos
- Nodemailer para notificaciones por correo
- Helmet para cabeceras HTTP seguras
- Express Rate Limit para limitar solicitudes

### Base de datos y servicios

- Supabase
- PostgreSQL
- Supabase Storage
- Google Safe Browsing API

### DevOps / despliegue

- Docker
- Docker Compose
- Nginx

---

## Estructura del proyecto

El proyecto utiliza una arquitectura modular por funcionalidades. En el frontend las funcionalidades se agrupan en `features/`, mientras que en el backend se agrupan en `modules/`.

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
│   │   │   ├── rateLimit.middleware.ts
│   │   │   ├── upload.middleware.ts
│   │   │   └── uploadProtocol.middleware.ts
│   │   ├── modules/
│   │   │   ├── activities/
│   │   │   ├── alerts/
│   │   │   ├── auth/
│   │   │   ├── complaints/
│   │   │   ├── dashboard/
│   │   │   ├── education/
│   │   │   ├── protocols/
│   │   │   ├── questionnaires/
│   │   │   ├── security/
│   │   │   └── subscriptions/
│   │   ├── routes/
│   │   │   └── index.ts
│   │   ├── services/
│   │   └── shared/
│   ├── Dockerfile
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
│   │   │   ├── logos/
│   │   │   ├── news/
│   │   │   └── questions/
│   │   ├── context/
│   │   ├── features/
│   │   │   ├── activities/
│   │   │   ├── admin/
│   │   │   ├── alerts/
│   │   │   ├── auth/
│   │   │   ├── complaints/
│   │   │   ├── dashboard/
│   │   │   ├── education/
│   │   │   ├── protocols/
│   │   │   ├── questionnaires/
│   │   │   └── security/
│   │   ├── shared/
│   │   ├── theme/
│   │   ├── responsive.css
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── nginx.conf
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
├── docker-compose.yml
├── .dockerignore
├── package.json
├── tsconfig.json
└── README.md
```

### Criterio de organización

- `features/`: agrupa vistas, componentes y lógica principal del frontend.
- `modules/`: agrupa controladores, rutas y servicios principales del backend.
- `shared/`: contiene utilidades y funciones reutilizables.
- `config/`: centraliza la configuración del entorno.
- `app/`: contiene navegación, menú y rutas protegidas.

---

## Instalación y ejecución local

### 1. Clonar el repositorio

```bash
git clone https://github.com/LoreDreamer/ProyectoWebMovil.git
cd ProyectoWebMovil
```

### 2. Instalar dependencias

Desde la raíz del proyecto:

```bash
npm run setup
```

Este comando instala dependencias de frontend y backend.

También se puede instalar por separado:

```bash
npm --prefix frontend install
npm --prefix backend install
```

### 3. Configurar variables de entorno

Crear el archivo real de entorno desde el ejemplo:

```bash
copy config\.env.example config\.env
```

En Linux/macOS:

```bash
cp config/.env.example config/.env
```

Luego completar `config/.env` con las credenciales reales.

### 4. Ejecutar frontend y backend juntos

Desde la raíz:

```bash
npm run dev
```

O también:

```bash
npm start
```

Servicios locales:

| Servicio | URL local | Descripción |
|---|---|---|
| Frontend | `http://localhost:5173` | Aplicación Ionic React |
| Backend | `http://localhost:3000` | API REST con Express |

### 5. Ejecutar solo frontend

```bash
npm run f
```

### 6. Ejecutar solo backend

```bash
npm run b
```

### 7. Compilar frontend

```bash
npm run build
```

### 8. Validar TypeScript del backend

```bash
cd backend
npx tsc --noEmit
```

---

## Variables de entorno

El proyecto usa un único archivo de variables de entorno compartido:

```txt
config/.env
```

Ejemplo:

```env
# =========================
# GENERAL
# =========================
NODE_ENV=development

# =========================
# BACKEND
# =========================
PORT=3000
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174

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

# =========================
# FRONTEND
# =========================
VITE_API_BASE_URL=http://localhost:3000

# =========================
# EMAIL
# =========================
EMAIL_FROM="Municipalidad Ciberseguridad <no-reply@santodomingo.test>"
ETHEREAL_USER=
ETHEREAL_PASS=

# =========================
# SERVICIO EXTERNO EF5
# Google Safe Browsing
# =========================
GOOGLE_SAFE_BROWSING_API_KEY=
GOOGLE_SAFE_BROWSING_CLIENT_ID=municipal-ciberseguridad
GOOGLE_SAFE_BROWSING_CLIENT_VERSION=1.0.0
```

> El archivo `config/.env` no debe subirse al repositorio. Solo debe versionarse `config/.env.example`.

---

## Ejecución con Docker

La plataforma puede levantarse mediante Docker Compose con frontend y backend separados.

Requisitos:

- Docker Desktop instalado y abierto.
- Archivo `config/.env` configurado.

Desde la raíz del proyecto:

```bash
docker compose up --build
```

Servicios dockerizados:

| Servicio | Contenedor | Tecnología | URL |
|---|---|---|---|
| Frontend | `municipal-ciberseguridad-frontend` | Nginx + build de Vite | `http://localhost:5173` |
| Backend | `municipal-ciberseguridad-backend` | Node.js 22 + Express | `http://localhost:3000` |

Para detener los contenedores:

```bash
docker compose down
```

Validaciones recomendadas:

```txt
Frontend: http://localhost:5173
Backend:  http://localhost:3000/api/test-db
EF5:      http://localhost:5173/herramientas
```

El frontend se compila con Vite y se sirve mediante Nginx. El backend se ejecuta en Node.js 22 para mantener compatibilidad con Supabase.

---

## Roles del sistema

### Usuario

Puede acceder a secciones públicas y protegidas destinadas a la comunidad:

- Inicio de usuario.
- Educación.
- Cuestionarios.
- Denuncias.
- Protocolos.
- Alertas.
- Herramientas de seguridad.
- Perfil y configuración.

### Administrador

Puede acceder al panel administrativo y gestionar información del sistema:

- Gestión de usuarios.
- Gestión de cuestionarios.
- Gestión de educación.
- Gestión de protocolos.
- Gestión de alertas.
- Gestión de actividades.
- Gestión/revisión de denuncias.

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

> Estas credenciales son solo para pruebas locales o académicas. No deben utilizarse en producción.

---

## Requerimientos funcionales

| Código | Requerimiento |
|---|---|
| RF1 | El sistema permite registrar usuarios e iniciar sesión mediante correo y contraseña. |
| RF2 | El sistema mantiene la sesión mediante token JWT y permite cerrar sesión. |
| RF3 | El sistema diferencia usuarios generales y administradores. |
| RF4 | El sistema muestra una página pública con información general de la plataforma. |
| RF5 | El usuario autenticado accede a un inicio personalizado con actividades y accesos relevantes. |
| RF6 | El sistema permite revisar contenidos educativos relacionados con ciberseguridad. |
| RF7 | El sistema permite acceder al detalle de módulos educativos. |
| RF8 | El sistema permite visualizar y responder cuestionarios. |
| RF9 | El sistema registra el progreso de cuestionarios del usuario. |
| RF10 | El sistema calcula riesgo de usuario según cuestionarios respondidos. |
| RF11 | El sistema permite enviar denuncias o reportes de incidentes. |
| RF12 | El sistema permite consultar protocolos de actuación. |
| RF13 | El sistema muestra alertas o noticias de ciberseguridad. |
| RF14 | El sistema permite registrar suscripciones por correo. |
| RF15 | El administrador accede a un panel administrativo. |
| RF16 | El administrador puede editar y eliminar usuarios. |
| RF17 | El administrador puede crear, editar o eliminar contenidos. |
| RF18 | El administrador puede revisar y eliminar denuncias. |
| RF19 | El sistema permite analizar URLs sospechosas mediante Google Safe Browsing. |

### Cálculo de riesgo

El riesgo se calcula según el porcentaje de cuestionarios respondidos respecto del total disponible:

```txt
0% a menos de 33%     → Riesgo alto
33% a menos de 66%    → Riesgo medio
66% a 100%            → Riesgo bajo
```

Ejemplo con 9 cuestionarios:

| Cuestionarios respondidos | Riesgo |
|---:|---|
| 0, 1 o 2 | Alto |
| 3, 4 o 5 | Medio |
| 6, 7, 8 o 9 | Bajo |

---

## Requerimientos no funcionales

| Código | Requerimiento |
|---|---|
| RNF1 | Seguridad mediante JWT, roles, CORS restringido, Helmet, rate limit y bcrypt. |
| RNF2 | Privacidad de credenciales mediante archivo `config/.env` no versionado. |
| RNF3 | Interfaz clara, consistente y fácil de utilizar. |
| RNF4 | Diseño responsive para escritorio y dispositivos móviles. |
| RNF5 | Código modular organizado por funcionalidades. |
| RNF6 | Arquitectura extensible para agregar nuevos módulos. |
| RNF7 | Rendimiento mediante lazy loading, imágenes WebP, paginación y consultas optimizadas. |
| RNF8 | Compatibilidad con navegadores modernos. |
| RNF9 | Respuestas eficientes desde backend con selección de columnas específicas y metadata de paginación. |
| RNF10 | Ejecución portable mediante Docker Compose. |

---

## Base de datos y modelo relacional

El proyecto utiliza Supabase con PostgreSQL para almacenar usuarios, actividades, noticias/alertas, protocolos, denuncias, educación, cuestionarios, progreso y suscripciones.

### Modelo relacional

<img width="6546" height="2936" alt="mermaid-diagram" src="https://github.com/user-attachments/assets/78c9e0ab-bb6a-4bdd-831d-cbd75efd90e5" />

### Integridad

Cada tabla posee claves primarias y, cuando corresponde, claves foráneas para mantener consistencia en las relaciones. El backend no ejecuta consultas SQL manuales, sino que usa el cliente de Supabase, reduciendo el riesgo de inyección SQL directa.

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
| `/herramientas` | SecurityToolsPage | Público/usuario |
| `/inicio` | InicioPage | Usuario autenticado |
| `/cuestionarios` | QuestionnairePage | Usuario autenticado |
| `/cuestionarios/:id/resolver` | QuestionnaireTakePage | Usuario autenticado |
| `/educacion/modulo/:id` | EducationModulePage | Usuario autenticado |
| `/protocolos` | ProtocolsPage | Usuario autenticado |
| `/admin` | AdminPage | Administrador |
| `/perfil` | PlaceholderPage | Usuario autenticado |
| `/configuracion` | PlaceholderPage | Usuario autenticado |

---

## Rutas principales del backend

Las rutas se montan desde:

```txt
backend/src/routes/index.ts
```

| Ruta base | Módulo | Descripción |
|---|---|---|
| `/api/auth` | Auth | Registro, login, sesión y usuarios. |
| `/api/alerts` | Alerts | Gestión y visualización de alertas. |
| `/api/denuncias` | Complaints | Registro, consulta y eliminación de denuncias. |
| `/api/protocolos` | Protocols | Gestión y visualización de protocolos. |
| `/api/activities` | Activities | Gestión y visualización de actividades. |
| `/api/education` | Education | Gestión y visualización de contenidos educativos. |
| `/api/questionnaires` | Questionnaires | Gestión, resolución y progreso de cuestionarios. |
| `/api/subscriptions` | Subscriptions | Registro de suscripciones por correo. |
| `/api/dashboard` | Dashboard | Resumen optimizado para inicio. |
| `/api/security` | Security | Herramientas de seguridad e integración externa. |
| `/api/test-db` | Test | Verificación de conexión con Supabase. |

### Endpoints destacados

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | Público | Registra usuario. |
| POST | `/api/auth/login` | Público | Inicia sesión. |
| GET | `/api/auth/me` | Autenticado | Obtiene usuario actual. |
| GET | `/api/auth/users` | Administrador | Lista usuarios. |
| PUT | `/api/auth/users/:id` | Administrador | Edita usuario. |
| DELETE | `/api/auth/users/:id` | Administrador | Elimina usuario. |
| GET | `/api/dashboard/summary` | Público/usuario | Obtiene totales optimizados para el inicio. |
| POST | `/api/security/url-check` | Público/usuario | Analiza URL sospechosa con Google Safe Browsing. |
| GET | `/api/alerts?page=1&limit=10` | Público | Lista alertas con paginación opcional. |
| GET | `/api/questionnaires?page=1&limit=10` | Público/usuario | Lista cuestionarios con paginación opcional. |
| GET | `/api/protocolos?page=1&limit=10` | Público/usuario | Lista protocolos con paginación opcional. |
| GET | `/api/education?page=1&limit=10` | Público | Lista educación con paginación opcional. |
| GET | `/api/activities?page=1&limit=6` | Público/usuario | Lista actividades con paginación opcional. |
| GET | `/api/denuncias?page=1&limit=10` | Administrador | Lista denuncias con paginación opcional. |

---

## Endpoints y pruebas funcionales

La documentación detallada de endpoints se encuentra en:

```txt
backend/endpoints.md
```

Las pruebas funcionales pueden realizarse con Postman usando:

```txt
baseUrl = http://localhost:3000
```

Pruebas recomendadas antes de entregar:

```txt
GET  /api/test-db
POST /api/auth/login
GET  /api/auth/me
GET  /api/dashboard/summary
POST /api/security/url-check
GET  /api/alerts?page=1&limit=10
GET  /api/questionnaires?page=1&limit=10
```

Casos de prueba relevantes:

- Login correcto como usuario o administrador.
- Acceso a rutas protegidas sin token: debe responder 401.
- Acceso a panel administrativo sin rol admin: debe responder 403.
- Creación de alerta con token admin.
- Creación de denuncia desde usuario.
- Consulta a Google Safe Browsing desde `/herramientas`.
- Ejecución con Docker usando `docker compose up --build`.

---

## Arquitectura de navegación

La navegación principal está centralizada en:

```txt
frontend/src/app/AppRoutes.tsx
```

El menú lateral y estructura principal se encuentran en:

```txt
frontend/src/app/AppMenu.tsx
```

La protección de rutas se gestiona mediante:

```txt
frontend/src/app/ProtectedRoute.tsx
```

Flujo general:

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
        ├── Alertas
        └── Herramientas
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

## Gestión administrativa

El panel administrativo permite gestionar recursos principales del sistema.

### Usuarios

El administrador puede:

- Ver usuarios registrados.
- Editar nombre, correo, región, comuna, estatus y tipo de usuario.
- Eliminar usuarios.
- Revisar el nivel de riesgo de cada usuario.

### Contenidos

El administrador puede crear, editar y eliminar:

- Actividades.
- Alertas/noticias.
- Educación.
- Protocolos.
- Cuestionarios.

### Denuncias

El administrador puede:

- Ver denuncias enviadas.
- Eliminar denuncias.

La denuncia se trata como un registro formal, por lo que el usuario solo la crea y el administrador la gestiona.

### Región y comuna

Los formularios usan un archivo TypeScript con regiones y comunas de Chile:

```txt
frontend/src/assets/data/chileRegions.ts
```

Esto evita errores de digitación y mantiene datos consistentes.

---

## Servicio externo EF5

La plataforma integra **Google Safe Browsing API** como servicio externo de ciberseguridad. Esta herramienta permite analizar URLs sospechosas sin que el usuario tenga que abrir directamente el enlace.

Ruta en frontend:

```txt
/herramientas
```

Endpoint backend:

```txt
POST /api/security/url-check
```

Variables requeridas:

```env
GOOGLE_SAFE_BROWSING_API_KEY=tu_api_key
GOOGLE_SAFE_BROWSING_CLIENT_ID=municipal-ciberseguridad
GOOGLE_SAFE_BROWSING_CLIENT_VERSION=1.0.0
```

Si la API key no está configurada, el sistema mantiene una validación local preventiva. Para defender EF5 como integración externa real, debe configurarse una clave válida de Google Safe Browsing.

---

## Cumplimiento de entrega final

| Entrega | Estado | Evidencia dentro del proyecto |
|---|---|---|
| EF1: Funcionalidades completas | Cumplida | CRUD/gestión de usuarios, actividades, alertas, educación, protocolos, cuestionarios y denuncias; notificaciones y almacenamiento local. |
| EF2: UI/UX y rendimiento | Cumplida | Diseño responsive, lazy loading de rutas, optimización de imágenes WebP, estados de carga/error/vacío y mejoras visuales en vistas principales. |
| EF3: Seguridad avanzada API | Cumplida | JWT, roles, bcrypt, Helmet, CORS restringido, rate limit, validaciones de archivos y sanitización con DOMPurify. |
| EF4: Optimización de consultas | Cumplida | Paginación opcional, selección de columnas específicas, metadata de paginación y endpoint `/api/dashboard/summary`. |
| EF5: Servicio externo | Cumplida | Integración con Google Safe Browsing API mediante `/api/security/url-check` para analizar URLs sospechosas. |
| EF6: Dockerización | Cumplida | Dockerfile frontend, Dockerfile backend, Nginx y `docker-compose.yml` para levantar la plataforma completa. |

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
| `npm --prefix frontend run dev` | Raíz | Ejecuta frontend desde la raíz. |
| `npm --prefix backend run dev` | Raíz | Ejecuta backend desde la raíz. |
| `cd frontend && npm run preview` | Frontend | Previsualiza el build del frontend. |
| `cd backend && npx tsc --noEmit` | Backend | Valida TypeScript del backend. |
| `docker compose up --build` | Raíz | Levanta frontend y backend con Docker. |
| `docker compose down` | Raíz | Detiene los contenedores. |

Puertos por defecto:

| Servicio | Puerto | URL |
|---|---:|---|
| Frontend | 5173 | `http://localhost:5173` |
| Backend | 3000 | `http://localhost:3000` |

---

## Notas de seguridad

- No subir `config/.env` al repositorio.
- No exponer `SUPABASE_SERVICE_ROLE_KEY` en el frontend.
- No pegar claves privadas o API keys en el README.
- Cambiar `JWT_SECRET` antes de producción.
- Rotar credenciales si fueron compartidas accidentalmente.
- Mantener `ALLOWED_ORIGINS` restringido a dominios conocidos.
- Mantener activas las reglas de seguridad correspondientes en Supabase.
- Usar contraseñas hasheadas con bcrypt.
- Sanitizar contenido HTML antes de renderizarlo.
- Usar `config/.env.example` solo como plantilla sin secretos reales.

---

## Formato CSV para cuestionarios

Los cuestionarios se cargan mediante archivos `.csv` con separador `;`.

Formato esperado:

```txt
pregunta;alternativa_a;alternativa_b;alternativa_c;alternativa_d;respuesta_correcta;puntaje
```

Reglas:

- `respuesta_correcta` debe ser `a`, `b`, `c` o `d`.
- El puntaje total recomendado por cuestionario es 100.
- El archivo debe incluir encabezado y preguntas válidas.

---

## Estado final del proyecto

El proyecto cuenta con arquitectura modular, frontend y backend separados, panel administrativo, autenticación por roles, almacenamiento externo, optimización de consultas, servicio externo de ciberseguridad y ejecución mediante Docker Compose.

Estado de entrega:

```txt
EF1 → Lista
EF2 → Lista
EF3 → Lista
EF4 → Lista
EF5 → Lista
EF6 → Lista
```
