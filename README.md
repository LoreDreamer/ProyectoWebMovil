# Plataforma Municipal de Ciberseguridad

Aplicación web desarrollada con **Ionic + React** orientada a fortalecer la educación, prevención y gestión de ciberseguridad en el contexto municipal. El proyecto busca entregar herramientas informativas, formativas y de reporte tanto para funcionarios municipales como para la ciudadanía, incorporando además un rol administrador encargado de gestionar contenidos, alertas y protocolos.

## 1. Descripción general del proyecto

La creciente digitalización de los municipios en Chile ha generado nuevos desafíos en materia de seguridad digital. En este contexto, las municipalidades manejan información sensible de vecinos, funcionarios y procesos administrativos, por lo que resulta necesario contar con herramientas que permitan prevenir incidentes, educar a los usuarios y centralizar información relevante sobre ciberseguridad.

Esta aplicación propone una plataforma municipal que permite informar, capacitar, alertar y apoyar a distintos tipos de usuarios frente a riesgos digitales, tales como phishing, filtración de datos, desconocimiento de protocolos o falta de canales claros para reportar incidentes.

El sistema contempla una capa pública, orientada principalmente a la ciudadanía, y una capa privada, destinada a usuarios autenticados y administradores.

## EP 1.1: Requerimientos funcionales y no funcionales

## 2. Roles del sistema

La aplicación considera dos tipos de roles principales: **Usuario** y **Administrador**.

### 2.1 Usuario

Corresponde a funcionarios municipales o ciudadanos que acceden a la plataforma para informarse, responder cuestionarios, revisar alertas, aprender protocolos básicos o realizar reportes.

### 2.2 Administrador

Corresponde a un encargado municipal o responsable de transformación digital/ciberseguridad. Este usuario tiene permisos para gestionar contenidos, publicar protocolos, administrar noticias, revisar reportes y mantener actualizada la información disponible en la plataforma.

## 3. Requerimientos funcionales

### RF1 - Visualización de alertas de ciberseguridad

El sistema debe mostrar una sección de alertas con noticias, advertencias y recomendaciones relacionadas con ciberseguridad. Estas alertas pueden informar sobre amenazas activas, campañas de phishing, fraudes digitales o recomendaciones emitidas por organismos oficiales.

**Rol relacionado:** Usuario y Administrador.

### RF2 - Suscripción a noticias de ciberseguridad

El sistema debe permitir que un usuario ingrese su correo electrónico para suscribirse a actualizaciones de noticias o alertas de ciberseguridad. Esta funcionalidad busca mantener informada a la comunidad municipal sobre amenazas recientes.

**Rol relacionado:** Usuario.

### RF3 - Cuestionarios de autodiagnóstico

El sistema debe permitir que los usuarios respondan cuestionarios sobre conocimientos y prácticas de ciberseguridad. El objetivo es evaluar el nivel de preparación del usuario frente a riesgos digitales comunes.

**Rol relacionado:** Usuario.

### RF4 - Visualización de resultados o nivel de riesgo

Después de responder un cuestionario, el sistema debe mostrar un resultado o retroalimentación que permita identificar el nivel de conocimiento o riesgo del usuario. Esta información puede servir para orientar futuras capacitaciones.

**Rol relacionado:** Usuario y Administrador.

### RF5 - Reporte de incidentes o ataques cibernéticos

El sistema debe permitir que usuarios o ciudadanos reporten incidentes relacionados con ciberseguridad, como intentos de estafa, phishing, robo de cuentas, suplantación de identidad u otros ataques digitales.

**Rol relacionado:** Usuario.

### RF6 - Gestión de protocolos de seguridad

El administrador debe poder gestionar protocolos, guías o documentos relacionados con buenas prácticas de ciberseguridad. Estos protocolos pueden incluir instrucciones sobre teletrabajo seguro, uso de contraseñas, reporte de incidentes, manejo de correos sospechosos y protección de datos.

**Rol relacionado:** Administrador.

### RF7 - Visualización de protocolos de seguridad

Los usuarios deben poder acceder a una sección donde se presenten protocolos y guías de seguridad digital. Esta funcionalidad permite que funcionarios y ciudadanos consulten instrucciones claras frente a situaciones de riesgo.

**Rol relacionado:** Usuario.

### RF8 - Gestión de novedades o actividades municipales

El administrador debe poder publicar actividades, eventos o novedades relacionadas con la educación en ciberseguridad, tales como charlas, campañas preventivas, talleres o capacitaciones.

**Rol relacionado:** Administrador.

### RF9 - Certificación o reconocimiento de conocimientos

El sistema debe permitir que los usuarios que completen actividades, cuestionarios o módulos educativos puedan obtener una certificación o constancia básica de participación o conocimiento en ciberseguridad.

**Rol relacionado:** Usuario.

## 4. Requerimientos no funcionales

### RNF1 - Seguridad y control de acceso por roles

El sistema debe diferenciar el acceso según el tipo de usuario. Las funciones administrativas, como la gestión de protocolos, alertas o actividades, deben estar protegidas y disponibles únicamente para usuarios con rol de administrador.

### RNF2 - Usabilidad y diseño responsive

La aplicación debe ser fácil de utilizar tanto en versión web como móvil. La interfaz debe considerar una navegación clara, botones visibles, jerarquía visual adecuada y formularios comprensibles para usuarios con distintos niveles de conocimiento tecnológico.

### RNF3 - Rendimiento

La aplicación debe cargar sus pantallas principales de forma rápida y fluida. Se busca que la navegación entre vistas sea eficiente y que los componentes se presenten sin demoras innecesarias.

### RNF4 - Escalabilidad frontend

La estructura del proyecto debe permitir agregar nuevas páginas, componentes y servicios sin afectar el funcionamiento general de la aplicación. Para ello, se organiza el código en carpetas separadas por responsabilidad.

### RNF5 - Mantenibilidad

El código debe mantener una separación clara entre páginas, componentes y estilos. Cada archivo `.tsx` debe contar con su propio archivo `.css` cuando corresponda, permitiendo una mantención más ordenada del diseño y la lógica visual.

## EP 1.2: Justificación del problema y análisis del usuario objetivo

## 5. Justificación del problema

La digitalización de los servicios municipales, impulsada por la Ley 21.180 sobre Transformación Digital del Estado, ha generado nuevos desafíos para las municipalidades chilenas. La literatura especializada advierte que los municipios enfrentan dificultades relevantes en planificación, recursos, procesos internos y comunicación institucional, lo que puede afectar su capacidad para implementar adecuadamente procesos digitales seguros. En particular, el artículo **“Gestión municipal en Chile y entrada en régimen de la Ley 21.180. El desafío de la transformación digital”** analiza la situación de 345 municipios chilenos e identifica déficits en planificación, recursos y comunicación entre actores institucionales y ciudadanía.  
Fuente: https://dialnet.unirioja.es/servlet/articulo?codigo=9540138

En este contexto, las municipalidades manejan información sensible de ciudadanos, funcionarios y procesos internos, pero muchas veces no cuentan con suficientes recursos, capacitación o cultura organizacional para enfrentar amenazas digitales de forma adecuada.

Entre los principales problemas detectados se encuentran:

- Falta de capacitación del personal municipal.
- Bajo conocimiento ciudadano sobre riesgos digitales.
- Ausencia de canales simples para reportar incidentes.
- Dificultad para centralizar protocolos y alertas.
- Falta de visibilidad sobre el nivel de preparación de los usuarios.
- Riesgo de exposición de datos personales o información sensible.

La plataforma propuesta busca responder a este problema mediante una solución educativa, preventiva y de gestión. La aplicación no solo informa sobre ciberseguridad, sino que también permite evaluar conocimientos, difundir protocolos, reportar incidentes y entregar herramientas al administrador para mantener actualizada la información.

De esta manera, el sistema contribuye a fortalecer la cultura de ciberseguridad municipal y a reducir la vulnerabilidad de funcionarios y ciudadanos frente a ataques digitales.

## 6. Usuario objetivo

La aplicación está dirigida a tres perfiles principales de usuarios.

### 6.1 Administrador municipal

El administrador corresponde al encargado de tecnología, transformación digital o ciberseguridad dentro del municipio.

#### Objetivos

- Gestionar alertas y noticias de ciberseguridad.
- Publicar protocolos y documentos oficiales.
- Revisar reportes de incidentes.
- Supervisar el nivel de conocimiento de los usuarios.
- Coordinar actividades educativas.

#### Necesidades

- Contar con una plataforma centralizada.
- Diferenciar contenidos públicos y privados.
- Acceder a herramientas de gestión.
- Mantener actualizada la información disponible.

#### Problema principal

El administrador no siempre cuenta con una herramienta clara para centralizar información, protocolos, alertas y reportes relacionados con ciberseguridad.

### 6.2 Funcionario municipal

El funcionario municipal corresponde a trabajadores de distintas áreas, como atención ciudadana, tránsito, tesorería, DIDECO u otras unidades.

#### Objetivos

- Aprender buenas prácticas de seguridad digital.
- Reconocer correos o enlaces sospechosos.
- Saber cómo actuar frente a incidentes.
- Acceder a protocolos internos de forma rápida.
- Reportar situaciones de riesgo.

#### Necesidades

- Información clara y fácil de entender.
- Acceso rápido a protocolos.
- Cuestionarios o capacitaciones simples.
- Canal de reporte accesible.

#### Problema principal

El funcionario puede manejar información sensible sin tener conocimientos técnicos suficientes para identificar riesgos digitales o responder adecuadamente ante un incidente.

### 6.3 Ciudadano o vecino

El ciudadano corresponde a una persona de la comunidad que utiliza servicios digitales y puede estar expuesta a fraudes, estafas o ataques informáticos.

#### Objetivos

- Informarse sobre riesgos digitales.
- Aprender medidas básicas de protección.
- Reportar ataques o intentos de estafa.
- Participar en actividades educativas.

#### Necesidades

- Lenguaje simple.
- Acceso desde dispositivos móviles.
- Información confiable.
- Interfaz intuitiva.

#### Problema principal

El ciudadano puede desconocer conceptos básicos de ciberseguridad y no saber cómo actuar frente a una amenaza digital.

## EP 1.4: Arquitectura de navegación y experiencia de usuario

## 7. Estado de esta sección

La arquitectura de navegación definitiva aún no se encuentra completamente implementada en el código del proyecto. Por lo tanto, las siguientes secciones quedan declaradas para ser completadas a medida que se definan las rutas, vistas y flujos reales de la aplicación.

## 8. Arquitectura general de navegación

La aplicación se proyecta como una arquitectura híbrida compuesta por vistas públicas y vistas protegidas. Esta estructura busca permitir que cualquier usuario pueda acceder a información educativa básica, mientras que ciertas funciones de gestión queden reservadas para usuarios autenticados o administradores.

Esta definición deberá ajustarse según las rutas efectivamente implementadas en el frontend.

## 9. Rutas principales



## 10. Rutas secundarias



## 11. Jerarquía de vistas



## 12. Flujo de navegación entre funcionalidades



## 13. Diferenciación de acceso según roles



## 14. Task flows principales



## 15. Puntos críticos de interacción



## 16. Coherencia entre dispositivos



## 17. Justificación técnica de la arquitectura



## 18. Estado actual del frontend



## 19. Instrucciones básicas de instalación



## 20. Estructura del proyecto



## 21. Entregables de la entrega parcial



## 22. Referencias

- Umaña Mardones, C. H. (2023). *Gestión municipal en Chile y entrada en régimen de la Ley 21.180. El desafío de la transformación digital*. Revista Mexicana de Análisis Político y Administración Pública, 12(23), 67-87.
- Dialnet: https://dialnet.unirioja.es/servlet/articulo?codigo=9540138
