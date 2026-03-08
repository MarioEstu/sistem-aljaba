# Estructura Académica del Proyecto de Graduación

## Desarrollo e implementación de un sistema web para optimizar la gestión de catálogos en Aljaba S.A.

---

## INTRODUCCIÓN 

En la actualidad, la presencia digital se ha convertido en un factor determinante para la
competitividad de las empresas comerciales, especialmente cuando se requiere presentar
productos de forma clara, atractiva y actualizada para facilitar la decisión de compra. En
este contexto, los catálogos digitales representan un medio práctico para comunicar
información relevante como descripción, precio, disponibilidad, imágenes y características
de los productos, permitiendo que los clientes consulten opciones sin depender de la
atención presencial. Sin embargo, en distintas organizaciones el proceso de elaboración y
mantenimiento de catálogos suele realizarse de manera manual, con uso de archivos
dispersos y procedimientos no estandarizados, lo cual provoca retrasos, duplicidad de
esfuerzos, inconsistencias en la información y costos operativos innecesarios.
La empresa Aljaba S.A. no es ajena a esta situación. La gestión de información de
productos y la generación de catálogos puede convertirse en una actividad repetitiva que
consume tiempo del personal, principalmente cuando se requiere actualizar precios, corregir
descripciones, sustituir imágenes o preparar catálogos para temporadas específicas y
distintos canales de difusión. Esta forma de trabajo tiende a afectar la eficiencia del proceso,
debido a que la información se modifica en varios lugares, no existe un control centralizado
y se incrementa el riesgo de errores en datos publicados. Como consecuencia, se reduce la
agilidad para responder a solicitudes comerciales, se limita la consistencia de la información
entregada al cliente y se eleva el costo asociado a la elaboración y mantenimiento de
materiales promocionales.
Ante lo anterior, el presente trabajo de graduación plantea el desarrollo e implementación de
un sistema web para optimizar la gestión de catálogos en Aljaba S.A., con el propósito de
centralizar la administración de productos y automatizar la generación de catálogos digitales
bajo un enfoque ordenado y controlado. El sistema se orienta a disminuir el tiempo
empleado en tareas repetitivas, mejorar la eficiencia operativa y reducir costos relacionados
con reprocesos, correcciones y elaboración manual. Asimismo, se busca establecer una
base tecnológica que facilite la actualización de información, mantenga coherencia en los
datos publicados y permita producir catálogos con estructura uniforme, listos para su
difusión digital.
La importancia de esta investigación se sustenta en la necesidad de obtener resultados
verificables y medibles que evidencien una mejora real en el proceso actual de Aljaba S.A.
Para ello, se realizará una evaluación comparativa del desempeño antes y después de la
implementación del sistema, considerando indicadores como el tiempo requerido para
generar un catálogo, el tiempo de actualización de información, la eficiencia en la gestión de
productos y el ahorro de costos asociado a la reducción de reprocesos y correcciones. Con
base en esta medición, será posible respaldar con evidencia el aporte práctico del sistema
dentro de la empresa y su contribución a la optimización de las actividades relacionadas con
la administración y generación de catálogos digitales.
El alcance del trabajo se enfoca en diseñar, construir e implementar una solución web que
contemple la administración de productos, categorías, precios, imágenes y características,
además de la generación de catálogos digitales con criterios definidos por la empresa.
También se contempla la identificación de usuarios que interactúan con el sistema, el
levantamiento de requerimientos y la definición de reglas operativas. De forma
complementaria, se desarrollará la ruta metodológica para la medición de resultados,
mediante instrumentos de recolección de datos y el análisis correspondiente, con el fin de
sustentar las conclusiones del estudio.
En síntesis, este trabajo propone una solución aplicable y medible para mejorar un proceso
específico dentro de Aljaba S.A., integrando el desarrollo e implementación de un sistema
web con una evaluación de resultados basada en evidencia. Con ello, se pretende contribuir
a la optimización de la gestión de catálogos, fortalecer la eficiencia operativa y demostrar el
valor de una implementación tecnológica orientada a necesidades reales de la empresa.

### 1.1. Antecedentes

Aljaba S.A. es una empresa guatemalteca dedicada a la comercialización de productos diversos. La empresa ha experimentado un crecimiento sostenido, pasando de un catálogo inicial de pocos cientos de productos a gestionar actualmente aproximadamente 4,000 productos, con una proyección de alcanzar 10,000 productos para finales del año 2026.

En el contexto actual del comercio digital, la presentación visual de productos mediante catálogos digitales se ha convertido en una herramienta fundamental para la comunicación con clientes y la generación de ventas. Aljaba S.A. reconoce esta necesidad y ha implementado un flujo de trabajo que involucra múltiples plataformas externas: Canva para edición de imágenes, Postimages para almacenamiento, y Catalog Machine para generación de catálogos en PDF.

Sin embargo, este enfoque multi-plataforma presenta desafíos significativos en términos de eficiencia operativa, costos mensuales elevados ($120 USD solo en Catalog Machine), y dependencia de servicios externos sobre los cuales la empresa no tiene control. Además, el proceso manual de seis pasos consume tiempo valioso del personal y presenta riesgos de pérdida de información al depender de plataformas de terceros.

### 1.2. Planteamiento del Problema

**Problema Principal:**  
Aljaba S.A. enfrenta un flujo de trabajo fragmentado y costoso para la creación y gestión de catálogos digitales, dependiendo de tres plataformas externas independientes, lo que resulta en:

1. **Altos costos operativos:** $120 USD mensuales solo en Catalog Machine, con tendencia a aumentar conforme crece el volumen de productos.

2. **Ineficiencia operativa:** El proceso actual requiere seis pasos secuenciales que involucran cambios constantes entre plataformas (Excel → Canva → Postimages → Excel → CSV → Catalog Machine), generando pérdida de tiempo y aumento en la probabilidad de errores humanos.

3. **Riesgo operativo:** Dependencia crítica de servicios externos que pueden fallar, cambiar sus términos de servicio, o incrementar precios sin previo aviso. La empresa no tiene control sobre sus propios datos e imágenes almacenadas en servicios de terceros.

4. **Limitaciones de escalabilidad:** Con una proyección de crecimiento de 4,000 a 10,000 productos, los costos de las plataformas actuales se incrementarán proporcionalmente, comprometiendo la viabilidad económica a largo plazo.

5. **Falta de integración:** Las plataformas actuales no están diseñadas para trabajar juntas, requiriendo exportaciones e importaciones manuales de datos entre sistemas.

**Pregunta de Investigación:**  
¿Es posible desarrollar un sistema web integrado que unifique las funcionalidades de edición de imágenes, almacenamiento y generación de catálogos digitales, reduciendo costos operativos y mejorando la eficiencia del flujo de trabajo de Aljaba S.A.?

### 1.3. Justificación

#### 1.3.1. Justificación Económica

El desarrollo de un sistema propio representa una oportunidad de ahorro significativo:

- **Ahorro mensual:** Reducción de $120/mes a $33/mes (72.5% de reducción)
- **Ahorro anual:** $1,044 USD en el primer año
- **ROI proyectado:** Recuperación de inversión inmediata, considerando que el costo de desarrollo es $0 (proyecto de graduación)

Adicionalmente, el costo mensual del sistema propuesto permanecerá fijo independientemente del crecimiento en el número de productos, mientras que las soluciones actuales escalan sus precios con el uso.

#### 1.3.2. Justificación Operativa

El sistema integrado propuesto reducirá el flujo de trabajo de 6 pasos a 3 pasos, eliminando transiciones entre plataformas y permitiendo que todo el proceso se realice dentro de un único sistema:

- **Reducción de tiempo:** Estimación de 50% menos tiempo en generación de catálogos
- **Reducción de errores:** Eliminación de errores por transferencia manual de datos
- **Mayor control:** Gestión centralizada de productos, imágenes y catálogos

#### 1.3.3. Justificación Técnica

El desarrollo con tecnologías web modernas (React, Node.js, PostgreSQL) garantiza:

- **Escalabilidad:** Arquitectura preparada para 10,000+ productos
- **Mantenibilidad:** Código estructurado y documentado
- **Seguridad:** Implementación de estándares actuales (HTTPS, JWT, encriptación)
- **Disponibilidad:** Acceso desde cualquier dispositivo con navegador web

#### 1.3.4. Justificación Estratégica

Desarrollar un sistema propio permite a Aljaba S.A.:

- **Independencia tecnológica:** No depender de terceros
- **Control de datos:** Propiedad total de información e imágenes
- **Customización:** Adaptación exacta a necesidades específicas
- **Ventaja competitiva:** Sistema único diseñado para su flujo de trabajo

#### 1.3.5. Justificación Académica

Este proyecto permite al estudiante:

- Aplicar conocimientos de ingeniería de software en un caso real
- Desarrollar un sistema completo de principio a fin
- Trabajar con tecnologías modernas de la industria
- Generar valor tangible para una empresa real
- Cumplir con requisitos de graduación mientras resuelve un problema empresarial

### 1.4. Objetivos

#### 1.4.1. Objetivo General

Desarrollar e implementar un sistema web integral para la gestión y generación de catálogos digitales que unifique las funcionalidades de edición de imágenes, almacenamiento y creación de PDFs, optimizando el flujo de trabajo y reduciendo los costos operativos de Aljaba S.A.

#### 1.4.2. Objetivos Específicos

1. **Analizar** el flujo de trabajo actual de Aljaba S.A. para identificar puntos de mejora y requerimientos del sistema.

2. **Diseñar** una arquitectura de software escalable y segura basada en tecnologías web modernas (React, Node.js, PostgreSQL).

3. **Implementar** un módulo de gestión de productos con funcionalidades de importación CSV, búsqueda avanzada, filtros y edición masiva.

4. **Desarrollar** un editor de imágenes avanzado con soporte para capas, efectos, máscaras y herramientas de edición profesional.

5. **Crear** un sistema de almacenamiento en la nube para imágenes con optimización automática y gestión eficiente.

6. **Construir** un diseñador visual de catálogos con múltiples layouts (grid, lista, fichas) y personalización completa de estilos.

7. **Implementar** un generador de PDF de alta calidad con renderizado optimizado y múltiples configuraciones.

8. **Desarrollar** un sistema de autenticación y autorización con roles diferenciados (Admin y Guest).

9. **Establecer** un mecanismo de compartir catálogos mediante enlaces únicos con control de permisos y expiración.

10. **Validar** el sistema mediante pruebas funcionales, de rendimiento y aceptación con usuarios reales de Aljaba S.A.

11. **Desplegar** el sistema en un ambiente de producción en la nube con monitoreo y backups automáticos.

12. **Documentar** técnicamente el sistema para facilitar futuro mantenimiento y extensiones.

### 1.5. Alcances y Limitaciones

#### 1.5.1. Alcances

El sistema **SÍ incluirá:**

1. **Gestión Completa de Productos:**
   - Importación de archivos CSV con validación automática
   - CRUD (Crear, Leer, Actualizar, Eliminar) de productos
   - Sistema de categorías y subcategorías jerárquicas
   - Búsqueda y filtros avanzados
   - Edición masiva de múltiples productos

2. **Sistema de Imágenes:**
   - Carga de imágenes en múltiples formatos (JPG, PNG, WEBP)
   - Almacenamiento en la nube (S3-compatible)
   - Optimización automática de imágenes
   - Galería visual de imágenes
   - Editor avanzado con capas, efectos y máscaras

3. **Diseñador de Catálogos:**
   - Creación de catálogos personalizados
   - Selección flexible de productos
   - Editor visual con drag & drop
   - Múltiples layouts predefinidos
   - Personalización de estilos, fuentes y colores

4. **Generación de PDF:**
   - Exportación a PDF de alta calidad
   - Múltiples configuraciones de página
   - Vista previa antes de generar

5. **Sistema de Compartir:**
   - Generación de enlaces únicos para clientes
   - Control de permisos por enlace
   - Fechas de expiración configurables
   - Protección con contraseña opcional

6. **Seguridad y Autenticación:**
   - Sistema de login con roles (Admin/Guest)
   - Encriptación de contraseñas
   - Comunicación HTTPS
   - Tokens JWT con expiración

7. **Infraestructura:**
   - Despliegue en la nube (DigitalOcean/AWS)
   - Backups automáticos diarios
   - Uptime del 99%

#### 1.5.2. Limitaciones

El sistema **NO incluirá** (al menos en la primera versión):

1. **Funcionalidades de E-commerce:**
   - No incluye carrito de compras
   - No procesa pagos
   - No gestiona pedidos o facturación

2. **Integración con Sistemas Externos:**
   - No se integra con ERP o sistemas contables
   - No sincroniza con plataformas de e-commerce (Shopify, WooCommerce)

3. **Aplicación Móvil Nativa:**
   - No habrá apps para iOS o Android
   - Solo acceso via navegador web (responsive design)

4. **Funcionalidades Avanzadas:**
   - No incluye sistema de versionado de catálogos
   - No soporta colaboración en tiempo real entre usuarios
   - No incluye analytics avanzado o reportes de uso

5. **Internacionalización:**
   - Solo idioma español en primera versión
   - No incluye conversión de monedas

6. **Capacidades Offline:**
   - Requiere conexión a internet para funcionar
   - No hay modo offline

7. **Limitaciones Técnicas:**
   - Límite recomendado de 1,000 productos por catálogo (rendimiento)
   - Tamaño máximo de imagen: 10MB
   - Formatos de imagen: JPG, PNG, WEBP (no soporta TIFF, RAW, etc.)

### 1.6. Metodología de Desarrollo

#### 1.6.1. Metodología Seleccionada: Desarrollo Ágil Incremental

Se utilizará una metodología híbrida que combina principios de **Desarrollo Ágil** y **Metodología Incremental**, adaptada a las características de un proyecto de graduación individual con cliente real.

**Razones de la elección:**
- Permite entregas incrementales con valor funcional
- Facilita feedback temprano del cliente
- Se adapta a cambios de requerimientos
- Adecuada para un solo desarrollador
- Balance entre planificación y flexibilidad

#### 1.6.2. Fases del Proyecto

**Fase 1: Análisis y Planificación (Semanas 1-2)**
- Entrevistas con usuarios de Aljaba S.A.
- Análisis del flujo de trabajo actual
- Definición detallada de requerimientos
- Diseño de arquitectura del sistema
- Selección de tecnologías
- Planificación de sprints

**Fase 2: Diseño (Semanas 3-4)**
- Diseño de base de datos
- Diseño de interfaces (wireframes y mockups)
- Diseño de APIs
- Diagramas UML completos
- Revisión con cliente

**Fase 3: Implementación (Semanas 5-16)**

*Sprint 1 (Semanas 5-6): Setup y Autenticación*
- Configuración de entorno de desarrollo
- Setup de repositorio Git
- Implementación de login/registro
- Estructura base del proyecto

*Sprint 2 (Semanas 7-9): Gestión de Productos*
- CRUD de productos
- Importación CSV
- Sistema de categorías
- Búsqueda y filtros

*Sprint 3 (Semanas 10-12): Imágenes*
- Carga de imágenes
- Almacenamiento en S3
- Galería de imágenes
- Editor básico de imágenes

*Sprint 4 (Semanas 13-14): Editor Avanzado*
- Sistema de capas
- Efectos y filtros
- Herramientas de edición avanzada

*Sprint 5 (Semanas 15-16): Catálogos y PDF*
- Creación de catálogos
- Diseñador visual
- Generación de PDF
- Sistema de compartir

**Fase 4: Pruebas (Semanas 17-18)**
- Pruebas unitarias
- Pruebas de integración
- Pruebas de rendimiento
- Pruebas con usuarios finales
- Corrección de bugs

**Fase 5: Despliegue (Semana 19)**
- Configuración de infraestructura de producción
- Migración de datos
- Despliegue del sistema
- Capacitación de usuarios

**Fase 6: Documentación (Semana 20)**
- Manual de usuario
- Documentación técnica
- Documento de tesis final

#### 1.6.3. Herramientas de Desarrollo

**Control de Versiones:**
- Git + GitHub

**Gestión de Proyecto:**
- GitHub Projects / Trello
- Documentación en Markdown

**Desarrollo:**
- Frontend: Visual Studio Code + React DevTools
- Backend: Visual Studio Code + Postman
- Base de Datos: Prisma Studio + pgAdmin

**Testing:**
- Jest + React Testing Library
- Supertest para APIs

**Despliegue:**
- DigitalOcean App Platform
- GitHub Actions para CI/CD

#### 1.6.4. Comunicación con el Cliente

- **Reuniones semanales:** Viernes, 1 hora
- **Demos incrementales:** Al final de cada sprint
- **Canal de comunicación:** Email + WhatsApp para urgencias
- **Validaciones:** Requieren aprobación escrita del cliente

---

**Última actualización:** 14 de febrero de 2026  
**Versión:** 1.0
