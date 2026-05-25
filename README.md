# Proyecto de Graduación: Catalog Aljaba

Sistema web integral para la gestión y generación de catálogos digitales de productos para Aljaba S.A., Guatemala.

---

## Inicio rápido — Desarrollo local

### Prerrequisitos
- Node.js 20+
- Docker Desktop (para PostgreSQL local)

### 1. Levantar la base de datos

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run db:seed          # Crea usuario admin/admin123
npm run dev              # http://localhost:4000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev              # http://localhost:3000
```

### Credenciales de prueba

| Usuario   | Contraseña | Rol   |
|-----------|------------|-------|
| admin     | admin123   | Admin |
| rutero01  | guest123   | Guest |

---

---

## Información del Proyecto

**Empresa Cliente:** Aljaba S.A. (Guatemala)  
**Tipo de Proyecto:** Sistema Web de Gestión de Catálogos  
**Propósito Académico:** Proyecto de Graduación - Ingeniería en Sistemas  
**Duración Estimada:** 5 meses (20 semanas)  
**Fecha de Inicio:** Febrero 2026  
**Fecha de Entrega:** Julio 2026

---

## Objetivos del Proyecto

### Objetivo Principal
Desarrollar un sistema web que unifique las funcionalidades de **Catalog Machine**, **Canva** y **Postimages** en una única plataforma propietaria, reduciendo costos operativos de $120/mes a $33/mes (72% de ahorro).

### Objetivos Específicos
1. Gestión completa de productos (CRUD, importación CSV, búsqueda avanzada)
2. Editor de imágenes avanzado (capas, efectos, máscaras)
3. Almacenamiento en la nube de imágenes
4. Diseñador visual de catálogos con múltiples layouts
5. Generación de PDF de alta calidad
6. Sistema de acceso para empleados ruteros (Guest access con autenticación)

---

## Problema que Resuelve

### Situación Actual de Aljaba S.A.
- **Flujo fragmentado:** 6 pasos, 3 plataformas diferentes
- **Alto costo:** $120/mes solo en Catalog Machine
- **Riesgo operativo:** Dependencia de servicios externos
- **Ineficiencia:** 2-3 horas para procesar 50 productos
- **Crecimiento proyectado:** De 4,000 a 10,000 productos

### Solución Propuesta
- **Flujo unificado:** 3 pasos, 1 plataforma propia
- **Bajo costo:** $33/mes total
- **Control total:** Sistema propietario, datos seguros
- **Eficiencia:** 45-60 minutos para 50 productos (50% de mejora)
- **Escalabilidad:** Costo fijo independiente del volumen

---

## Arquitectura del Sistema

### Stack Tecnológico

#### Frontend
- **Framework:** React 18+ con TypeScript
- **Build Tool:** Vite
- **UI Components:** Material-UI (MUI) + TailwindCSS
- **State Management:** Zustand + React Query
- **Editor de Imágenes:** Fabric.js / React Konva
- **Drag & Drop:** React DnD

#### Backend
- **Runtime:** Node.js 20 LTS
- **Framework:** Express.js con TypeScript
- **ORM:** Prisma
- **Autenticación:** JWT + bcrypt
- **Procesamiento de Imágenes:** Sharp
- **Generación PDF:** Puppeteer / PDFKit
- **Validación:** Zod

#### Base de Datos
- **DBMS:** PostgreSQL 15+
- **Hosting:** Neon (Serverless) o DigitalOcean Managed DB

#### Almacenamiento
- **Imágenes:** DigitalOcean Spaces (S3-compatible)
- **PDFs:** Temporal en S3 (24 horas)

#### Infraestructura
- **Hosting:** DigitalOcean App Platform
- **CDN:** Cloudflare
- **CI/CD:** GitHub Actions
- **Monitoreo:** Uptime Robot (gratis)

---

## Estructura de Documentación

```
docs/
├── DOCUMENTO_PROYECTO.md           # Descripción general y contexto
├── REQUERIMIENTOS_DETALLADOS.md    # Requerimientos funcionales y no funcionales
├── ARQUITECTURA_SISTEMA.md         # Arquitectura técnica y stack
├── RESUMEN_EJECUTIVO_ALJABA.md        # Presentación para jefes de Aljaba
├── ESTRUCTURA_ACADEMICA.md            # Guía para documento de tesis
├── diagramas/
│   └── DIAGRAMAS_UML.md               # Todos los diagramas UML en Mermaid
└── requerimientos/
    └── (archivos adicionales según avance)
```

---

## Funcionalidades Principales

### 1. Módulo de Autenticación
- Login/Registro de usuarios Admin
- Roles: Admin (control total) y Guest (solo visualización)
- Recuperación de contraseña
- Tokens JWT con expiración

### 2. Módulo de Gestión de Productos
- Importación masiva desde CSV
- CRUD completo de productos
- Categorías y subcategorías jerárquicas
- Búsqueda y filtros avanzados
- Edición masiva (hasta 500 productos)
- 6 precios configurables por producto

### 3. Módulo de Imágenes
- Carga de imágenes (JPG, PNG, WEBP)
- Almacenamiento en la nube (S3)
- Optimización automática
- Galería visual con thumbnails
- Editor avanzado:
  - Recorte, rotación, redimensionamiento
  - Ajustes de color (brillo, contraste, saturación)
  - Capas de texto e imágenes
  - Efectos y filtros
  - Máscaras de transparencia

### 4. Módulo de Catálogos
- Creación de catálogos personalizados
- Selección flexible de productos
- Múltiples layouts:
  - Grid (2, 3, 4, 6 productos por página)
  - Lista horizontal
  - Fichas detalladas
- Editor visual con drag & drop
- Personalización de estilos, colores y fuentes
- Vista previa en tiempo real

### 5. Módulo de Generación PDF
- PDFs de alta calidad
- Múltiples configuraciones de página (A4, Carta, Tabloide)
- Orientación vertical/horizontal
- Compresión optimizada para web
- Generación rápida (< 10 seg para 100 productos)

### 6. Módulo de Guest Access (Empleados Ruteros)
- Cuentas de acceso para empleados ruteros (usuario y contraseña)
- El Admin habilita o deshabilita catálogos visibles para todos los Guests
- Visualización de catálogos habilitados por el Admin
- Descarga de PDF de catálogos habilitados
- Interfaz simple y responsive para uso en campo

---

## Análisis de Costos

### Comparación Mensual

|       Concepto       | Solución Actual | Sistema Propuesto |    Ahorro   |
|----------------------|-----------------|-------------------|-------------|
| Catalog Machine      |    $120/mes     |         -         |     $120    |
| Postimages           |    Gratis (Pérdida de datos)      |         -         |      -      |
| Canva                |   Uso gratuito  |         -         |      -      |
| **Hosting App**      |        -        |      $12/mes      |      -      |
| **Almacenamiento**   |        -        |      $5/mes       |      -      |
| **Dominio**          |        -        |      $1/mes       |      -      |
| **TOTAL**            |   **$120/mes**  |     **$33/mes**   | **$87/mes** |

*Postimages gratis tiene limitaciones y riesgo de pérdida de datos.

### Ahorro Anual
- **Año 1:** $1,044 USD de ahorro
- **Año 2:** $1,044 USD de ahorro
- **Total 2 años:** $2,088 USD

### ROI (Retorno de Inversión)
- **Inversión inicial:** $12 (dominio)
- **Costo de desarrollo:** $0 (proyecto de graduación)
- **Recuperación:** Inmediata (mes 1)

---

## Capacidad y Escalabilidad

### Capacidades del Sistema
- **Productos:** Hasta 10,000 productos
- **Imágenes:** Hasta 50,000 imágenes (50GB)
- **Usuarios Admin:** Hasta 10 usuarios
- **Usuarios Guest simultáneos:** Hasta 100
- **Productos por catálogo:** Hasta 1,000
- **Catálogos:** Ilimitados

### Rendimiento Esperado
- Carga de página: < 3 segundos
- Búsqueda de productos: < 1 segundo
- Generación PDF (100 productos): < 10 segundos
- Importación CSV (1000 productos): < 30 segundos

---

## Cronograma de Desarrollo

|           Fase               |  Duración | Semanas |       Entregable Clave          |
|------------------------------|-----------|---------|---------------------------------|
| **Fase 1: Setup y Base**     | 2 semanas |   1-2   | Login funcional                 |
| **Fase 2: Productos**        | 3 semanas |   3-5   | CRUD + Importación CSV          |
| **Fase 3: Imágenes**         | 3 semanas |   6-8   | Carga + Galería + Editor básico |
| **Fase 4: Editor Avanzado**  | 3 semanas |  9-11   | Editor con capas completo       |
| **Fase 5: Catálogos**        | 4 semanas |  12-15  | Diseño y layouts                |
| **Fase 6: PDF**              | 2 semanas |  16-17  | Generación PDF                  |
| **Fase 7: Guest Access**     | 1 semana  |   18    | Vista de empleados ruteros      |
| **Fase 8: Testing y Deploy** | 2 semanas |  19-20  | Sistema en producción           |

**Total: 20 semanas (5 meses)**

---

## Seguridad

### Medidas Implementadas
- Comunicación HTTPS obligatoria
- Autenticación con JWT (expiración 24h)
- Contraseñas hasheadas con bcrypt (cost factor 12)
- Rate limiting: 100 req/min por IP
- Validación y sanitización de inputs
- Protección contra SQL injection (uso de ORM)
- Protección contra XSS
- URLs firmadas para imágenes en S3
- Backups automáticos diarios

---

## Plan de Pruebas

### Tipos de Pruebas
1. **Pruebas Unitarias:** Lógica de negocio (Jest)
2. **Pruebas de Integración:** APIs (Supertest)
3. **Pruebas de Componentes:** UI React (React Testing Library)
4. **Pruebas de Rendimiento:** Carga y estrés
5. **Pruebas de Seguridad:** Vulnerabilidades comunes
6. **Pruebas de Aceptación:** Con usuarios finales de Aljaba

### Objetivo de Cobertura
- **Mínimo:** 60% de cobertura de código
- **Ideal:** 80% en módulos críticos

---

## Documentación Incluida

### Documentación Técnica
1. **Documento de Proyecto:** Contexto y objetivos
2. **Requerimientos Detallados:** Funcionales y no funcionales
3. **Arquitectura del Sistema:** Stack y decisiones técnicas
4. **Diagramas UML:** Casos de uso, clases, secuencia, componentes, despliegue
5. **Manual de Instalación:** Setup de desarrollo
6. **Documentación de API:** Endpoints REST
7. **Guía de Contribución:** Para futuros desarrolladores

### Documentación de Usuario
1. **Manual de Usuario Admin:** Cómo usar todas las funcionalidades
2. **Manual de Usuario Guest:** Acceso a catálogos compartidos
3. **FAQs:** Preguntas frecuentes

### Documentación Académica
1. **Estructura de Tesis:** Guía completa
2. **Resumen Ejecutivo:** Para presentación a Aljaba S.A.

---

## Roles de Usuario

### Administrador (Admin)
**Permisos:**
-  Gestión completa de productos
-  Importación y exportación CSV
-  Carga y edición de imágenes
-  Creación y diseño de catálogos
-  Generación de PDFs
-  Habilitación/deshabilitación de catálogos para Guests
-  Creación y gestión de cuentas Guest
-  Configuración del sistema

### Invitado (Guest)
**Permisos:**
-  Inicio de sesión con usuario y contraseña propios
-  Visualizar catálogos habilitados por el Admin
-  Descargar PDFs de catálogos habilitados
-  Sin acceso a gestión de productos, imágenes ni configuración

---

##  Despliegue

### Entorno de Producción
- **URL:** [Por definir]
- **Plataforma:** DigitalOcean App Platform
- **Base de Datos:** DigitalOcean Managed PostgreSQL
- **Almacenamiento:** DigitalOcean Spaces
- **CDN:** Cloudflare

### Proceso de Despliegue
1. Push a rama `main` en GitHub
2. GitHub Actions ejecuta:
   - Linting (ESLint)
   - Type checking (TypeScript)
   - Tests unitarios
   - Build frontend y backend
3. Deploy automático a DigitalOcean
4. Health check automático
5. Notificación de despliegue exitoso

---

##  Contacto

**Estudiante/Desarrollador:**  
Mario Estuardo López Rodas 
estuardopez2004@gmail.com 
+502 55685491

**Empresa Cliente:**  
Aljaba S.A.  
 Guatemala  

**Universidad:**  
Universidad Mariano Gálvez
 Facultad de Ingeniería  
 Carrera: Ingeniería en Sistemas  

---

##  Licencia y Propiedad

**Propiedad Intelectual:** Aljaba S.A.  
**Desarrollo:** Mario Estuardo López Rodas  
**Uso:** Exclusivo para Aljaba S.A.  
**Código:** Privado (repositorio privado en GitHub)

---

##  Estado del Proyecto

**Estado Actual:**  Planificación y Documentación  
**Siguiente Fase:**  Setup de Desarrollo  
**Progreso General:** 10%

### Tareas Completadas
-  Análisis de requerimientos
-  Definición de arquitectura
-  Selección de stack tecnológico
-  Creación de diagramas UML
-  Documentación técnica inicial
-  Análisis de costos

### Próximas Tareas
-  Setup de repositorio Git
-  Configuración de entornos (dev/prod)
-  Implementación de autenticación
-  Diseño de interfaces (mockups)

---

## Referencias

### Tecnologías
- [React Documentation](https://react.dev)
- [Node.js Documentation](https://nodejs.org)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Competidores Analizados
- [Catalog Machine](https://www.catalogmachine.com)
- [Canva](https://www.canva.com)
- [Lucidpress](https://www.lucidpress.com)

---

**Última actualización:** 14 de febrero de 2026  
**Versión del documento:** 1.0
