# Plataforma Municipal de Ciberseguridad

---

## Integrantes

- Lucas Contreras
- Eduardo Cordero
- Constanza Suárez

---

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
13. [Base de Datos y Modelo Relacional](#base-de-datos-y-modelo-relacional)
14. [Arquitectura general de navegación](#arquitectura-general-de-navegación)
15. [Rutas principales del frontend](#rutas-principales-del-frontend)
16. [Rutas principales del backend](#rutas-principales-del-backend)
17. [Endpoints y Pruebas funcionales](#pruebas-funcionales)
18. [Jerarquía de vistas](#jerarquía-de-vistas)
19. [Flujo de navegación](#flujo-de-navegación)
20. [Diferenciación de acceso según roles](#diferenciación-de-acceso-según-roles)
21. [Gestión administrativa](#gestión-administrativa)
22. [Notas de seguridad](#notas-de-seguridad)
23. [Cumplimiento de Entrega Final](#cumplimiento-de-entrega-final)
24. [Ejecución con Docker](#ejecución-con-docker)
25. [Servicio externo EF5](#servicio-externo-ef5)

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
- Google Safe Browsing API

### DevOps / despliegue

- Docker
- Docker Compose
- Nginx

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

### 11. Ejecutar con Docker

La plataforma también puede ejecutarse mediante Docker Compose, levantando frontend y backend en contenedores separados:

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

### 12. Resumen de comandos principales

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

### 13. Flujo recomendado para ejecutar por primera vez

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

### 14. Flujo recomendado para validar antes de entregar

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

ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174

EMAIL_FROM="Municipalidad Ciberseguridad <no-reply@santodomingo.test>"
ETHEREAL_USER=
ETHEREAL_PASS=

GOOGLE_SAFE_BROWSING_API_KEY=
GOOGLE_SAFE_BROWSING_CLIENT_ID=municipal-ciberseguridad
GOOGLE_SAFE_BROWSING_CLIENT_VERSION=1.0.0

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

## Base de Datos y Modelo Relacional

En este proyecto se hizo uso de Supabase mediante el uso se PostgreSQL para hostear la base datos donde se guardan todos los datos de usuarios, actividades, noticias y otras variables.

### Modelo Relacional

<img width="6546" height="2936" alt="mermaid-diagram" src="https://github.com/user-attachments/assets/78c9e0ab-bb6a-4bdd-831d-cbd75efd90e5" />

### Integridad 

Cada tabla tiene sus propias claves únicas, y aquellas tablas que necesitan de claves foraneas también poseen estas mismas, así evitando mixups mantiendo constancia a la hora de relacionar datos.

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

## Endpoints y pruebas funcionales

La documentación de los endpoints se encuentra disponible en `backend/endpoints.md`, donde podrán encontrar toda la documentación sobre los endpoints en materia de las respuestas HTTP usadas, los tipos de mensajes usados, los permisos necesarios para poder acceder a ciertos materiales y varios otros detalles.

Por el lado de las pruebas funcionales, se hizo uso de Postman para probar la funcionalidad de nuestra página web. Se hace uso de http://localhost:3000 como variable llamada baseUrl.

### Login correcto como admin

Al hacer login como admin, el sistema espera las siguientes variables:

- Autenticación JWT funcionando.
- Rol indicando que el usuario es administrador.

<img width="716" height="689" alt="image" src="https://github.com/user-attachments/assets/e8f6370f-df3c-41fc-807c-641e7445de4b" />

### Acceder perfil sin token

Al tratar de acceder el perfil sin token, debido a la protección de rutas, el sistema rechaza la conexión con un error 401.

<img width="701" height="475" alt="image-1" src="https://github.com/user-attachments/assets/f6606341-f39f-4cee-96cb-5167a978181d" />

### Acceder perfil con token 

Utilizando el mismo token de la sesión de admin, se puede apreciar un mensaje 200, autorizando al usuario para que entre al perfil.

<img width="711" height="683" alt="image-2" src="https://github.com/user-attachments/assets/02257827-f048-48b1-9194-bc56b09b287f" />

### Crear alerta sin token

Al tratar de crear una alerta, el sistema no solamente debe verificar si uno es administrador, pero que también si tiene permisos mediante el uso de tokens. En este caso, al tratar de alertar sin token, no se puede publicar alertas.

<img width="712" height="481" alt="image-3" src="https://github.com/user-attachments/assets/e6599999-9d42-4280-9a43-764a0dce24d8" />

### Crear alerta con token

Si uno tiene administrador y tiene token, puede observar un mensaje 200 OK que autoriza la operación y mediante la segunda imagen se puede observar que se realiza correctamente la operación.

<img width="706" height="659" alt="image-4" src="https://github.com/user-attachments/assets/08fbba0e-b5a9-42e6-b9d9-8c594c8cdcaf" />
<img width="1191" height="679" alt="image-5" src="https://github.com/user-attachments/assets/81285e7f-b268-4a7c-b6e3-31b9b616338c" />

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

## Notas finales

- No subir `config/.env` al repositorio.
- No exponer `SUPABASE_SERVICE_ROLE_KEY` en el frontend.
- No usar contraseñas de prueba en producción.
- Cambiar `JWT_SECRET` antes de desplegar.
- Validar permisos administrativos tanto en frontend como en backend.
- Mantener activas las reglas de seguridad correspondientes en Supabase.

Cabe destacar unos detalles bien importantes con respecto a la seguridad, especialmente por el lado de la **Inyección SQL**. Debido a que no hacen consultas directas mediante el uso de SQL, sino que mediante el uso de la API de Supabase para estos casos, hay una protección básica en caso de inyecciones SQL. Esto esta demostrado en la sección de pruebas SQL, donde es necesario tener los datos directos del usuario/administrador para poder realizar acciones dentro de la página web.

Por otro lado, la presencia de encriptación dentro de la misma base de datos presenta otra barrera en caso de fallos de seguridad.

<img width="1612" height="433" alt="image" src="https://github.com/user-attachments/assets/5b0927d8-a74d-4fa4-a5c6-e3620c7a177c" />


Finalmente, en la sección de alertas se detalla el uso de un sistema de suscripción para alertas. Al ingresar un correo que se encuentra dentro de la BDD, el sistema lo dejará registrado dentro de la BDD para el envío de alertas, las cuales se "envían" mediante el uso de Ethereal emails, donde realmente no se mandan correos.

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

## Formato

Formato archivos .csv para cuestionarios:
```txt
pregunta;alternativa_a;alternativa_b;alternativa_c;alternativa_d;respuesta_correcta;puntaje
```

Puntaje máximo por cuestionario: 100.

respuesta_correcta usa letras:
```txt
a, b, c o d
```

---


---

## Cumplimiento de Entrega Final

La versión final del proyecto cumple con los puntos solicitados para la entrega final:

| Entrega | Estado | Evidencia dentro del proyecto |
|---|---|---|
| EF1: Funcionalidades completas | Cumplida | CRUD/gestión de usuarios, actividades, alertas, educación, protocolos, cuestionarios y denuncias; notificaciones y almacenamiento local. |
| EF2: UI/UX y rendimiento | Cumplida | Diseño responsive, lazy loading de rutas, optimización de imágenes WebP, estados de carga/error/vacío y mejoras visuales en vistas principales. |
| EF3: Seguridad avanzada API | Cumplida | JWT, roles, bcrypt, Helmet, CORS restringido, rate limit, validaciones de archivos y sanitización de contenido HTML con DOMPurify. |
| EF4: Optimización de consultas | Cumplida | Paginación opcional, selección de columnas específicas, metadata de paginación y endpoint `/api/dashboard/summary` para evitar cargas innecesarias. |
| EF5: Servicio externo | Cumplida | Integración con Google Safe Browsing API mediante `/api/security/url-check` para analizar URLs sospechosas. |
| EF6: Dockerización | Cumplida | Dockerfile para frontend, Dockerfile para backend, Nginx y `docker-compose.yml` para levantar la plataforma completa. |

---

## Ejecución con Docker

Para ejecutar la plataforma final dockerizada se debe tener Docker Desktop abierto y el archivo real `config/.env` configurado.

Desde la raíz del proyecto:

```bash
docker compose up --build
```

URLs de prueba:

```txt
Frontend: http://localhost:5173
Backend:  http://localhost:3000/api/test-db
```

Para detener la ejecución:

```bash
docker compose down
```

El frontend se compila con Vite y se sirve mediante Nginx. El backend se ejecuta en un contenedor Node.js 22 para mantener compatibilidad con Supabase.

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

Variables requeridas en `config/.env`:

```env
GOOGLE_SAFE_BROWSING_API_KEY=tu_api_key
GOOGLE_SAFE_BROWSING_CLIENT_ID=municipal-ciberseguridad
GOOGLE_SAFE_BROWSING_CLIENT_VERSION=1.0.0
```

Si la API key no está configurada, el sistema mantiene una validación local preventiva, pero para defender EF5 como integración externa debe configurarse una clave real de Google Safe Browsing.

## Estado del proyecto

El proyecto cuenta con una arquitectura modular por funcionalidades, separación entre frontend y backend, configuración centralizada de variables de entorno, rutas protegidas por rol y panel administrativo para gestionar usuarios y contenidos principales.
