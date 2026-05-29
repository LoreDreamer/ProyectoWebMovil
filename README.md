# Plataforma Municipal de Ciberseguridad

Aplicación web desarrollada con **Ionic + React** orientada a la educación, prevención y gestión básica de ciberseguridad. La plataforma permite a los usuarios revisar información educativa, noticias, protocolos, cuestionarios y realizar denuncias. Además, contempla un acceso administrativo para gestionar información y revisar datos generales del sistema.

## Estructura del Proyecto

```
ProyectoWebMovil/
├── frontend/                 # Código fuente del frontend (Ionic + React)
│   ├── src/                 # Código TypeScript/React
│   │   ├── assets/          # Imágenes y datos estáticos
│   │   ├── components/      # Componentes reutilizables
│   │   ├── pages/           # Páginas de la aplicación
│   │   ├── context/         # Context API (ej. AuthContext)
│   │   ├── theme/           # Estilos globales
│   │   ├── App.tsx          # Componente principal
│   │   └── main.tsx         # Punto de entrada
│   ├── public/              # Archivos estáticos públicos
│   ├── package.json         # Dependencias del frontend
│   ├── vite.config.ts       # Configuración de Vite
│   ├── tsconfig.json        # Configuración de TypeScript
│   └── index.html           # HTML principal
├── backend/                 # Servidor backend (Node.js + Express)
│   ├── controllers/         # Controladores de rutas
│   ├── routes/              # Definición de rutas API
│   ├── middleware/          # Middleware personalizado
│   ├── config/              # Configuración (JWT, Supabase)
│   ├── src/                 # Código de servicios
│   ├── package.json         # Dependencias del backend
│   ├── server.ts            # Punto de entrada del servidor
│   └── tsconfig.json        # Configuración de TypeScript
├── package.json             # Scripts de gestión del proyecto
├── tsconfig.json            # Referencias de TypeScript
└── README.md                # Este archivo
```

## Guía de Instalación y Ejecución

### Requisitos
- Node.js v18 o superior
- npm o yarn

### Instalación de dependencias
```bash
# Instalar ambas (frontend y backend)
npm run install:all

# O instalar por separado
npm run frontend:install
npm run backend:install
```

### Ejecución local

**Frontend (desarrollo):**
```bash
npm run frontend:dev
# O directamente desde la carpeta frontend:
cd frontend
npm run dev
```

**Backend (desarrollo):**
```bash
npm run backend:dev
# O directamente desde la carpeta backend:
cd backend
npm run dev
```

**Frontend (build para producción):**
```bash
npm run frontend:build
```

## 1. Descripción general del proyecto

La digitalización de servicios y procesos municipales aumenta la necesidad de contar con herramientas que ayuden a prevenir riesgos de ciberseguridad. Muchas personas utilizan plataformas digitales sin tener conocimientos suficientes para reconocer amenazas como phishing, estafas, robo de información o malas prácticas de seguridad.

Este proyecto propone una plataforma web y móvil orientada a entregar información clara sobre ciberseguridad, permitir el acceso a contenidos educativos, facilitar reportes o denuncias, y entregar al administrador una vista de gestión general.

## 2. Integrantes

- Integrante 1: Eduardo Cordero
- Integrante 2: Lucas Contreras
- Integrante 3: Constanza Suarez

## 3. Roles del sistema

La aplicación considera dos roles principales.

### Usuario

El usuario general puede navegar por las secciones públicas de la aplicación, revisar información educativa, consultar protocolos, leer noticias o alertas, responder cuestionarios y realizar denuncias.

### Administrador

El administrador puede acceder al panel administrativo de la aplicación. Desde este panel puede manejar usuarios, publicar noticias o actividades, y revisar estadísticas generales relacionadas con el nivel de riesgo de ciberseguridad de los usuarios.

Para acceder como administrador en la versión actual del proyecto:

```txt
Correo: admin@inicio
Contraseña: 1234
```

Después de iniciar sesión, se debe presionar el ícono de perfil para ingresar al panel administrativo.

## EP 1.1: Requerimientos funcionales y no funcionales

## 4. Requerimientos funcionales

### RF1 - Visualización de noticias y alertas

El sistema debe mostrar una sección de noticias o alertas relacionadas con ciberseguridad.

**Rol relacionado:** Usuario y Administrador.

### RF2 - Suscripción a noticias

El sistema debe permitir que el usuario se suscriba para recibir información o novedades relacionadas con ciberseguridad.

**Rol relacionado:** Usuario.

### RF3 - Visualización de contenido educativo

El sistema debe contar con una sección educativa sobre ciberseguridad, buenas prácticas digitales y prevención de riesgos.

**Rol relacionado:** Usuario.

### RF4 - Cuestionarios de ciberseguridad

El sistema debe permitir que los usuarios accedan a cuestionarios relacionados con conocimientos o prácticas de ciberseguridad.

**Rol relacionado:** Usuario.

### RF5 - Denuncias o reportes

El sistema debe permitir que los usuarios accedan a una sección para reportar incidentes, amenazas o situaciones sospechosas.

**Rol relacionado:** Usuario.

### RF6 - Visualización de protocolos

El sistema debe contar con una sección de protocolos o recomendaciones de seguridad digital.

**Rol relacionado:** Usuario.

### RF7 - Panel administrativo

El sistema debe contar con una vista administrativa accesible para usuarios con rol administrador.

**Rol relacionado:** Administrador.

### RF8 - Gestión de usuarios

El administrador debe poder manejar información asociada a usuarios de la plataforma.

**Rol relacionado:** Administrador.

### RF9 - Estadísticas generales de riesgo

El administrador debe poder revisar estadísticas generales sobre el riesgo o avance de los usuarios en materia de ciberseguridad.

**Rol relacionado:** Administrador.

### RF10 - Publicación de noticias o actividades

El administrador debe poder publicar noticias, actividades o contenidos informativos relacionados con ciberseguridad.

**Rol relacionado:** Administrador.

## 5. Requerimientos no funcionales

### RNF1 - Seguridad y control de acceso por roles

El sistema debe diferenciar el acceso entre usuario general y administrador, evitando que funciones administrativas estén disponibles para usuarios sin permisos.

### RNF2 - Usabilidad

La interfaz debe ser clara, con formularios comprensibles, botones visibles y navegación simple.

### RNF3 - Diseño responsive

La aplicación debe adaptarse correctamente a distintos tamaños de pantalla, considerando uso web y móvil.

### RNF4 - Rendimiento

Las pantallas principales deben cargar de forma fluida y permitir navegación sin demoras innecesarias.

### RNF5 - Mantenibilidad

El código debe mantener una separación clara entre páginas, componentes, estilos y recursos visuales.

## EP 1.2: Justificación del problema y análisis del usuario objetivo

## 6. Justificación del problema

La ciberseguridad es un aspecto cada vez más importante dentro de los servicios digitales. Los usuarios pueden estar expuestos a amenazas como correos fraudulentos, robo de datos, suplantación de identidad o desconocimiento de buenas prácticas digitales.

La plataforma busca responder a este problema mediante una solución educativa y preventiva, que permita centralizar información, entregar contenidos simples, facilitar denuncias y apoyar la gestión administrativa de la información relacionada con ciberseguridad.

Como referencia académica del contexto municipal chileno, se considera el artículo de Carlos Humberto Umaña Mardones sobre la gestión municipal en Chile y la entrada en régimen de la Ley 21.180, el cual aborda los desafíos asociados a la transformación digital municipal.

## 7. Usuario objetivo

La aplicación está dirigida a dos perfiles principales.

### 7.1 Usuario general

Corresponde a una persona que utiliza la plataforma para informarse sobre ciberseguridad, revisar noticias, responder cuestionarios, consultar protocolos o realizar denuncias.

#### Objetivos

- Aprender sobre ciberseguridad.
- Revisar noticias o alertas.
- Consultar protocolos.
- Responder cuestionarios.
- Realizar denuncias o reportes.

#### Necesidades

- Lenguaje simple.
- Navegación clara.
- Acceso rápido a información relevante.
- Formularios fáciles de completar.
- Interfaz adaptable a computador y móvil.

### 7.2 Administrador

Corresponde a un usuario con permisos especiales para acceder al panel administrativo.

#### Objetivos

- Publicar noticias o actividades.
- Manejar usuarios.
- Revisar estadísticas generales.
- Gestionar información relevante de la plataforma.

#### Necesidades

- Acceso diferenciado mediante credenciales.
- Panel administrativo claro.
- Herramientas para administrar contenido.
- Vista general del estado de los usuarios.

## EP 1.4: Arquitectura de navegación y experiencia de usuario

## 8. Arquitectura general de navegación

La aplicación utiliza una arquitectura basada en rutas, páginas y componentes reutilizables. La navegación se implementa con Ionic React y React Router.

El proyecto utiliza componentes de Ionic como:

- `IonApp`
- `IonReactRouter`
- `IonRouterOutlet`
- `IonMenu`
- `IonHeader`
- `IonToolbar`
- `IonContent`
- `IonPage`
- `IonButton`
- `IonInput`
- `IonSelect`

## 9. Rutas principales

| Ruta | Vista asociada | Descripción |
|---|---|---|
| `/` | HomePage | Ruta inicial de la aplicación. |
| `/index` | HomePage | Página principal del sitio. |
| `/inicio` | InicioPage | Vista inicial alternativa. |
| `/login` | LoginPage | Pantalla de inicio de sesión. |
| `/register` | RegisterPage | Pantalla de registro de usuario. |
| `/educacion` | EducationPage | Sección educativa. |
| `/denuncias` | ComplaintsPage | Sección de denuncias o reportes. |
| `/cuestionarios` | QuestionnairePage | Sección de cuestionarios. |
| `/protocolos` | ProtocolsPage | Sección de protocolos. |
| `/alertas` | NewsPage | Sección de noticias o alertas. |
| `/admin` | AdminPage | Panel administrativo. |

## 10. Rutas secundarias

| Ruta | Vista asociada | Descripción |
|---|---|---|
| `/perfil` | PlaceholderPage | Vista temporal de perfil. |
| `/configuracion` | PlaceholderPage | Vista temporal de configuración. |

## 11. Jerarquía de vistas

```txt
Aplicación
│
├── Vistas generales
│   ├── Inicio
│   ├── Educación
│   ├── Denuncias
│   ├── Cuestionarios
│   ├── Protocolos
│   └── Alertas
│
├── Autenticación
│   ├── Login
│   └── Registro
│
├── Usuario
│   ├── Perfil
│   └── Configuración
│
└── Administración
    └── Panel administrador
```

## 12. Flujo de navegación

El flujo general de usuario es:

```txt
Inicio
→ Sección seleccionada desde navbar o menú lateral
→ Interacción con contenido, formulario o cuestionario
```

El flujo de autenticación es:

```txt
Login / Registro
→ Validación de datos
→ Acceso a la aplicación
```

El flujo de administrador es:

```txt
Login con admin@inicio y contraseña 1234
→ Ícono de perfil
→ Panel administrativo
```

## 13. Diferenciación de acceso según roles

### Usuario general

Puede acceder a las secciones principales de la aplicación:

- Inicio.
- Educación.
- Denuncias.
- Cuestionarios.
- Protocolos.
- Alertas.
- Perfil.
- Configuración.

### Administrador

Puede acceder a las secciones generales y al panel administrativo, donde puede manejar usuarios, publicar noticias o actividades y revisar estadísticas generales.

## 14. Task flows principales

### Registro de usuario

```txt
Usuario entra a Registro
→ Completa datos solicitados
→ Selecciona región y comuna
→ Acepta términos y condiciones
→ Envía formulario
```

### Inicio de sesión

```txt
Usuario entra a Login
→ Ingresa correo y contraseña
→ Envía formulario
→ Accede a la aplicación
```

### Acceso administrador

```txt
Administrador entra a Login
→ Ingresa admin@inicio
→ Ingresa contraseña 1234
→ Presiona ícono de perfil
→ Accede al panel administrativo
```

### Denuncia

```txt
Usuario entra a Denuncias
→ Completa información solicitada
→ Envía reporte
```

### Cuestionario

```txt
Usuario entra a Cuestionarios
→ Responde preguntas
→ Envía respuestas
```

## 15. Puntos críticos de interacción

Los puntos críticos de interacción son:

- Inicio de sesión.
- Registro.
- Selección de región y comuna.
- Aceptación de términos y condiciones.
- Acceso mediante ícono de perfil.
- Acceso al panel administrativo.
- Envío de denuncias.
- Uso de cuestionarios.
- Navegación mediante navbar o menú lateral.

## 16. Coherencia entre dispositivos

La aplicación se desarrolla con Ionic React, lo que permite construir una interfaz adaptable para web y móvil. En pantallas grandes se prioriza la navegación mediante navbar y menú lateral. En pantallas pequeñas se busca mantener una estructura simple, con contenido organizado verticalmente y botones fáciles de presionar.

## 17. Justificación técnica de la arquitectura

La arquitectura se basa en la separación entre páginas, componentes, estilos y recursos visuales. Las páginas representan vistas completas asociadas a rutas, mientras que los componentes agrupan partes reutilizables de la interfaz, como formularios, navbar, noticias, educación, denuncias, cuestionarios y suscripción.

Esta organización facilita mantener el código ordenado, reutilizar componentes y continuar agregando funcionalidades en futuras entregas.

## EP 1.5: Creación del proyecto en Ionic con React

## 18. Implementación inicial del frontend

El proyecto cuenta con una estructura inicial en Ionic + React. Actualmente considera:

- Uso de React Router con Ionic React Router.
- Rutas declaradas en `src/App.tsx`.
- Uso de menú lateral y navegación superior.
- Vistas organizadas en `src/pages`.
- Componentes reutilizables organizados en `src/components`.
- Formularios de inicio de sesión y registro.
- Panel administrativo básico.

## 19. Estructura del proyecto

```txt
ProyectoWebMovil/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── complaints/
│   │   ├── education/
│   │   ├── forms/
│   │   ├── hero/
│   │   ├── info/
│   │   ├── inicio/
│   │   ├── navbar/
│   │   ├── news/
│   │   ├── questionnaire/
│   │   ├── subscribe/
│   │   └── index.ts
│   ├── pages/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── complaints/
│   │   ├── education/
│   │   ├── home/
│   │   ├── inicio/
│   │   ├── news/
│   │   ├── placeholder/
│   │   ├── protocols/
│   │   ├── questionnaires/
│   │   └── index.ts
│   ├── theme/
│   ├── App.tsx
│   ├── global.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## EP 1.6: Diseño de pantallas principales

## 20. Pantallas principales

| Pantalla | Ruta | Descripción |
|---|---|---|
| Inicio | `/` y `/index` | Página principal de la aplicación. |
| Inicio alternativo | `/inicio` | Vista adicional de inicio. |
| Login | `/login` | Inicio de sesión. |
| Registro | `/register` | Creación de cuenta. |
| Educación | `/educacion` | Contenido educativo. |
| Denuncias | `/denuncias` | Reporte de incidentes. |
| Cuestionarios | `/cuestionarios` | Preguntas o evaluación. |
| Protocolos | `/protocolos` | Recomendaciones o guías. |
| Alertas / Noticias | `/alertas` | Noticias y alertas. |
| Panel administrador | `/admin` | Gestión administrativa. |
| Perfil | `/perfil` | Vista temporal de perfil. |
| Configuración | `/configuracion` | Vista temporal de configuración. |

## 21. Instrucciones de instalación y ejecución

### Clonar el repositorio

```bash
git clone https://github.com/LoreDreamer/ProyectoWebMovil.git
```

### Entrar a la carpeta del proyecto

```bash
cd ProyectoWebMovil
```

### Instalar dependencias

```bash
npm install
```

### Ejecutar el proyecto

```bash
npm run dev
```

## 22. Referencias

- Umaña Mardones, C. H. (2023). *Gestión municipal en Chile y entrada en régimen de la Ley 21.180. El desafío de la transformación digital*. Revista Mexicana de Análisis Político y Administración Pública, 12(23), 67-87. Disponible en: https://dialnet.unirioja.es/servlet/articulo?codigo=9540138
