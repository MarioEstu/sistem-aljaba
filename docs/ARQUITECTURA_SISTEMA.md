# Arquitectura del Sistema y Stack Tecnológico - Catalog Aljaba

## 1. ARQUITECTURA DEL SISTEMA

### 1.1 Arquitectura General

```
┌──────────────────────────────────────────────────────────────┐
│                      CAPA DE PRESENTACIÓN                    │
│                     (Frontend - React SPA)                   │
└──────────────────────────────────────────────────────────────┘
                              ↕ HTTPS/REST API
┌──────────────────────────────────────────────────────────────┐
│                      CAPA DE APLICACIÓN                      │
│                   (Backend - Node.js + Express)              │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐              │
│  │   Auth     │  │  Products  │  │  Catalogs  │              │
│  │  Service   │  │  Service   │  │  Service   │              │
│  └────────────┘  └────────────┘  └────────────┘              │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐              │
│  │  Image     │  │    PDF     │  │   Guest    │              │
│  │  Service   │  │  Generator │  │  Service   │              │
│  └────────────┘  └────────────┘  └────────────┘              │
└──────────────────────────────────────────────────────────────┘
                              ↕
┌──────────────────────────────────────────────────────────────┐
│                      CAPA DE DATOS                           │
│                                                              │
│  ┌──────────────────────┐      ┌──────────────────────┐      │
│  │   PostgreSQL         │      │    AWS S3            │      │
│  │  (Datos relacionales)│      │  (Almacén imágenes)  │      │
│  └──────────────────────┘      └──────────────────────┘      │
└──────────────────────────────────────────────────────────────┘
```

---

### 1.2 Decisiones Arquitectónicas Clave

#### 1.2.1 Single Page Application (SPA)
**Decisión:** Frontend como SPA con React  
**Razones:**
- Experiencia de usuario fluida sin recargas de página
- Interactividad necesaria para el editor visual
- Ecosistema maduro con librerías para todas las funcionalidades
- Facilitad de mantenimiento y escalabilidad

---

#### 1.2.2 API RESTful
**Decisión:** Backend expone API REST  
**Razones:**
- Estándar de la industria
- Stateless (escalable horizontalmente)
- Fácil de documentar (Swagger)
- Compatible con cualquier cliente (web, móvil futuro)

---

#### 1.2.3 Base de Datos Relacional
**Decisión:** PostgreSQL  
**Razones:**
- Datos estructurados con relaciones complejas (productos, categorías, catálogos)
- Soporte JSON para flexibilidad en metadata
- Rendimiento probado con millones de registros
- Backup y recuperación robusta
- Costo cero (versión open source)

---

#### 1.2.4 Almacenamiento de Imágenes en Nube
**Decisión:** AWS S3 (o compatible como DigitalOcean Spaces)  
**Razones:**
- Almacenamiento escalable sin límite
- CDN integrado para carga rápida
- Pay-as-you-go (50GB ≈ $1-2/mes)
- URLs firmadas para seguridad
- Backups automáticos

---

## 2. STACK TECNOLÓGICO

### 2.1 Frontend Stack

#### Framework Principal
**React 18+** con **Vite**

**Razones:**
- React: ecosistema más grande, componentes reutilizables, comunidad activa
- Vite: build ultra rápido, hot reload instantáneo, configuración mínima

#### Lenguaje
**TypeScript**

**Razones:**
- Type safety reduce errores en runtime
- Mejor autocompletado y refactoring
- Documentación implícita en el código
- Estándar en proyectos empresariales

#### Librerías UI
| Librería | Propósito | Alternativa |
|----------|-----------|-------------|
| **Material-UI (MUI)** | Componentes UI | Ant Design, Chakra UI |
| **TailwindCSS** | Estilos utility-first | Bootstrap, Styled Components |
| **React Router v6** | Navegación SPA | - |
| **React Query (TanStack Query)** | State management server | SWR, Redux Toolkit |
| **Zustand** | State management local | Redux, Jotai |

#### Librerías Especializadas

**Editor de Imágenes:**
- **Fabric.js** - Canvas manipulation avanzada
- **React Konva** - Wrapper React para Konva.js
- **Cropper.js** - Crop de imágenes

**Editor de Catálogos:**
- **React DnD (Drag and Drop)** - Drag & drop nativo
- **React Grid Layout** - Layouts responsivos

**Otros:**
- **Axios** - HTTP client
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de esquemas
- **date-fns** - Manejo de fechas

---

### 2.2 Backend Stack

#### Runtime y Framework
**Node.js 20 LTS + Express.js**

**Razones:**
- JavaScript full-stack (mismo lenguaje frontend/backend)
- Rendimiento alto para I/O intensivo
- Ecosistema NPM masivo
- Express: minimalista, flexible, probado

**Alternativa considerada:** NestJS (más estructurado pero mayor complejidad)

#### Lenguaje
**TypeScript**

**Razones:** Mismas que frontend + seguridad de tipos en APIs

#### ORM/Database Client
**Prisma ORM**

**Razones:**
- Type-safe queries
- Migraciones automáticas
- Generador de cliente tipado
- Soporte PostgreSQL nativo
- Admin UI incluida

**Alternativa:** TypeORM, Sequelize

#### Autenticación
**JWT (jsonwebtoken) + bcrypt**

**Razones:**
- Stateless (escalable)
- Estándar de industria
- No requiere sesiones en servidor

**Librería adicional:** `express-rate-limit` para rate limiting

#### Procesamiento de Imágenes
**Sharp**

**Razones:**
- Librería más rápida de Node.js para imágenes
- Resize, crop, compress, format conversion
- Memoria eficiente

#### Generación de PDF
**PDFKit** o **Puppeteer**

**Comparación:**

| Característica | PDFKit | Puppeteer |
|----------------|--------|-----------|
| **Flexibilidad** | Alta (programático) | Media (HTML to PDF) |
| **Rendimiento** | Muy rápido | Medio (consume más RAM) |
| **Curva de aprendizaje** | Media | Baja (usa HTML/CSS) |


**Decisión recomendada:** Iniciar con **Puppeteer** para velocidad de desarrollo. La generación se ejecuta de forma **asíncrona mediante una cola de trabajos** (`pdf_jobs`) para evitar bloqueos del servidor y timeouts en catálogos grandes. Esta cola se implementa desde la Fase 1, no como optimización posterior.

#### Validación
**Zod** (misma librería que frontend)

**Razones:**
- Esquemas compartibles entre frontend/backend
- Type inference automática
- Mensajes de error personalizables

#### Almacenamiento de Archivos
**AWS SDK para S3** o **@aws-sdk/client-s3**

**Configuración recomendada:**
- Bucket privado
- URLs firmadas con expiración
- CDN CloudFront opcional

---

### 2.3 Base de Datos

#### Sistema Gestor
**PostgreSQL 15+**

#### Hosting
**AWS RDS** (Relational Database Service) o **Neon** (serverless Postgres)

**Comparación:**

| Opción | Costo Mensual | Pros | Contras |
|--------|---------------|------|---------|
| **AWS RDS (t3.micro)** | ~$15/mes | Confiable, backups automáticos | Costo fijo |
| **Neon (Serverless)** | $0-10/mes | Pay-per-use, generoso free tier | Nuevo (menos maduro) |
| **DigitalOcean Managed DB** | $15/mes | Simple, buen soporte | Menor flexibilidad |

**Recomendación:** **Neon** para desarrollo y MVP, migrar a AWS RDS si se requiere más control.

#### Esquema de Base de Datos (Preliminar)

```sql
-- Tabla de usuarios
users
  id: UUID PRIMARY KEY
  username: VARCHAR UNIQUE
  password_hash: VARCHAR
  name: VARCHAR
  role: ENUM('admin', 'guest')
  active: BOOLEAN DEFAULT true
  created_at: TIMESTAMP

-- Tabla de categorías (auto-referencial para jerarquía)
categories
  id: UUID PRIMARY KEY
  name: VARCHAR
  parent_id: UUID REFERENCES categories(id)
  created_at: TIMESTAMP

-- Tabla de productos
products
  id: UUID PRIMARY KEY
  name: VARCHAR
  code: VARCHAR UNIQUE
  description: TEXT
  category_id: UUID REFERENCES categories(id)
  price1: DECIMAL
  price2: DECIMAL
  price3: DECIMAL
  price4: DECIMAL
  price5: DECIMAL
  price6: DECIMAL
  stock: INTEGER
  image_id: UUID REFERENCES images(id)
  created_at: TIMESTAMP
  updated_at: TIMESTAMP

-- Tabla de imágenes
images
  id: UUID PRIMARY KEY
  filename: VARCHAR
  url: VARCHAR
  thumbnail_url: VARCHAR
  s3_key: VARCHAR
  size_bytes: INTEGER
  width: INTEGER
  height: INTEGER
  created_at: TIMESTAMP

-- Tabla de catálogos
catalogs
  id: UUID PRIMARY KEY
  name: VARCHAR
  description: TEXT
  config: JSONB (formato, layout, estilos)
  guest_visible: BOOLEAN DEFAULT false
  pdf_url: VARCHAR NULLABLE
  created_by: UUID REFERENCES users(id)
  created_at: TIMESTAMP
  updated_at: TIMESTAMP

-- Relación productos-catálogos (many-to-many)
catalog_products
  id: UUID PRIMARY KEY
  catalog_id: UUID REFERENCES catalogs(id)
  product_id: UUID REFERENCES products(id)
  position: INTEGER (orden en catálogo)

-- Cola de trabajos de generación de PDF
pdf_jobs
  id: UUID PRIMARY KEY
  catalog_id: UUID REFERENCES catalogs(id)
  status: ENUM('pending', 'processing', 'completed', 'failed')
  error_message: TEXT NULLABLE
  requested_by: UUID REFERENCES users(id)
  started_at: TIMESTAMP NULLABLE
  completed_at: TIMESTAMP NULLABLE
  created_at: TIMESTAMP
```

---

### 2.4 Infraestructura y Deployment

#### Hosting de Aplicación
**Opción Recomendada: AWS Elastic Beanstalk** o **DigitalOcean App Platform**

**Comparación:**

| Servicio | Costo Estimado | Pros | Contras |
|----------|----------------|------|---------|
| **AWS Elastic Beanstalk** | $25-40/mes | Escalable, integración AWS | Configuración compleja |
| **DigitalOcean App Platform** | $12-24/mes | Simple, precio fijo | Menos flexible |
| **Render.com** | $7-20/mes | Deploy automático desde Git | Menor rendimiento |
| **Railway.app** | $5-15/mes | UX excelente | Servicio nuevo |

**Recomendación:** **DigitalOcean App Platform** (balance precio/facilidad)

**Configuración:**
- **Frontend:** Build estático deployado en CDN
- **Backend:** Contenedor Docker con Node.js
- **Database:** PostgreSQL managed
- **Storage:** DigitalOcean Spaces (compatible S3)

---

#### Arquitectura de Deployment

```
┌──────────────────────────────────────────────────────┐
│                    USUARIOS                          │
└──────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────┐
│              CLOUDFLARE (CDN + SSL)                  │
│              - Cache de assets estáticos             │
│              - Protección DDoS                       │
└──────────────────────────────────────────────────────┘
                         ↓
        ┌────────────────┴────────────────┐
        ↓                                 ↓
┌─────────────────┐              ┌─────────────────┐
│   Frontend      │              │    Backend      │
│   (Static CDN)  │              │  (App Platform) │
│   React Build   │              │   Node.js API   │
└─────────────────┘              └─────────────────┘
                                          ↓
                         ┌────────────────┴────────────────┐
                         ↓                                 ↓
                ┌─────────────────┐              ┌─────────────────┐
                │   PostgreSQL    │              │  DigitalOcean   │
                │   (Managed DB)  │              │     Spaces      │
                │                 │              │   (S3-like)     │
                └─────────────────┘              └─────────────────┘
```

---

#### CI/CD Pipeline
**GitHub Actions** (gratis para repositorios públicos/privados)

**Flujo:**
1. Push a rama `main`
2. GitHub Actions ejecuta:
   - Linting (ESLint)
   - Type checking (TypeScript)
   - Tests unitarios
   - Build frontend y backend
3. Deploy automático a DigitalOcean App Platform

---

### 2.5 Seguridad

#### SSL/TLS
- Certificado SSL gratis con Let's Encrypt (incluido en DigitalOcean)
- Forzar HTTPS en producción

#### Variables de Entorno
Secrets management:
- `.env` files en desarrollo (no commiteados)
- Variables de entorno en plataforma de hosting

**Variables críticas:**
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=...
```

#### Rate Limiting
- 100 requests/minuto por IP en rutas públicas
- 1000 requests/minuto para usuarios autenticados

#### CORS
- Whitelist de dominios permitidos
- Bloquear cross-origin requests no autorizados

---

## 3. ANÁLISIS DE COSTOS

### 3.1 Costos Mensuales Estimados (USD)

#### Opción 1: DigitalOcean Stack (RECOMENDADA)

| Servicio | Especificación | Costo Mensual |
|----------|----------------|---------------|
| **App Platform** | Basic (1GB RAM, 1 vCPU) | $12 |
| **Managed PostgreSQL** | Basic (1GB RAM, 10GB) | $15 |
| **Spaces (Storage)** | 50GB + CDN | $5 |
| **Bandwidth** | Hasta 1TB incluido | $0 |
| **Backup** | Automático incluido | $0 |
| **Dominio** | .com/.net/etc | $12/año ≈ $1/mes |
| | **TOTAL** | **$33/mes** |

**Ahorro vs. solución actual:** $120 - $33 = **$87/mes (72.5% de reducción)**

---

#### Opción 2: AWS Stack (Mayor Escalabilidad)

| Servicio | Especificación | Costo Mensual |
|----------|----------------|---------------|
| **EC2** | t3.small (2GB RAM) | $15 |
| **RDS PostgreSQL** | db.t3.micro (1GB RAM) | $15 |
| **S3** | 50GB storage + requests | $2 |
| **CloudFront CDN** | 1TB bandwidth | $8 |
| **Route 53** | DNS hosting | $1 |
| **Certificate Manager** | SSL gratis | $0 |
| | **TOTAL** | **$41/mes** |

**Ahorro vs. solución actual:** $120 - $41 = **$79/mes (65.8% de reducción)**

---

#### Opción 3: Presupuesto Mínimo (Render + Neon)

| Servicio | Especificación | Costo Mensual |
|----------|----------------|---------------|
| **Render Web Service** | Starter (512MB RAM) | $7 |
| **Neon Postgres** | Scale tier | $19 |
| **Cloudflare R2** | 50GB storage | $0.75 |
| | **TOTAL** | **$26.75/mes** |

**Ahorro vs. solución actual:** $120 - $27 = **$93/mes (77.5% de reducción)**

---

### 3.2 Proyección de Costos a 12 Meses

**Opción DigitalOcean (Recomendada):**
- Meses 1-12: $33/mes × 12 = **$396/año**
- **Ahorro anual:** $1,440 - $396 = **$1,044**

**Costos actuales de Aljaba:**
- Catalog Machine: $120/mes × 12 = $1,440/año
- Postimages: gratis con limitaciones

---

### 3.3 Costos de Desarrollo (One-time)

| Concepto | Costo |
|----------|-------|
| Dominio (.com) | $12/año |
| Licencias de software | $0 (todo open source) |
| Herramientas de desarrollo | $0 (VS Code, Git, etc.) |
| Certificado SSL | $0 (Let's Encrypt) |
| **TOTAL** | **$12** |

---

## 4. ESTRUCTURA DEL PROYECTO

### 4.1 Estructura de Directorios

```
catalog-aljaba/
├── frontend/                 # Aplicación React
│   ├── public/
│   ├── src/
│   │   ├── assets/           # Imágenes, fuentes, etc.
│   │   ├── components/       # Componentes reutilizables
│   │   │   ├── common/       # Botones, inputs, cards
│   │   │   ├── products/     # Componentes de productos
│   │   │   ├── catalogs/     # Componentes de catálogos
│   │   │   └── editor/       # Editor de imágenes
│   │   ├── pages/            # Páginas principales
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Products.tsx
│   │   │   ├── Catalogs.tsx
│   │   │   └── GuestView.tsx
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API calls (axios)
│   │   ├── store/            # State management (Zustand)
│   │   ├── types/            # TypeScript types
│   │   ├── utils/            # Funciones helper
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                  # API Node.js
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── products.controller.ts
│   │   │   ├── images.controller.ts
│   │   │   ├── catalogs.controller.ts
│   │   │   └── pdf.controller.ts
│   │   ├── services/         # Lógica de negocio
│   │   │   ├── auth.service.ts
│   │   │   ├── products.service.ts
│   │   │   ├── images.service.ts
│   │   │   ├── csv.service.ts
│   │   │   ├── pdf.service.ts
│   │   │   └── s3.service.ts
│   │   ├── routes/           # Definición de rutas
│   │   │   ├── auth.routes.ts
│   │   │   ├── products.routes.ts
│   │   │   ├── images.routes.ts
│   │   │   └── catalogs.routes.ts
│   │   ├── middleware/       # Middlewares
│   │   │   ├── auth.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   └── upload.middleware.ts
│   │   ├── prisma/           # Prisma ORM
│   │   │   └── schema.prisma
│   │   ├── types/            # TypeScript types
│   │   ├── utils/            # Helpers
│   │   ├── config/           # Configuración
│   │   │   ├── database.ts
│   │   │   ├── s3.ts
│   │   │   └── jwt.ts
│   │   ├── app.ts            # Express app
│   │   └── server.ts         # Entry point
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                     # Documentación
│   ├── DOCUMENTO_PROYECTO.md
│   ├── REQUERIMIENTOS_DETALLADOS.md
│   ├── ARQUITECTURA_SISTEMA.md
│   ├── diagramas/
│   └── requerimientos/
│
├── .github/
│   └── workflows/
│       └── deploy.yml        # CI/CD con GitHub Actions
│
├── docker-compose.yml        # Para desarrollo local
├── .gitignore
└── README.md
```

---

## 5. TECNOLOGÍAS COMPLEMENTARIAS

### 5.1 Desarrollo y Testing

| Herramienta | Propósito |
|-------------|-----------|
| **ESLint** | Linting de código JavaScript/TypeScript |
| **Prettier** | Formateo automático de código |
| **Husky** | Git hooks para pre-commit checks |
| **Jest** | Testing unitario backend |
| **Vitest** | Testing unitario frontend (más rápido que Jest) |
| **React Testing Library** | Testing de componentes React |
| **Supertest** | Testing de APIs HTTP |
| **Docker** | Desarrollo local con base de datos |

---

### 5.2 Monitoreo y Logs (Opcional - Fase 2)

| Herramienta | Propósito | Costo |
|-------------|-----------|-------|
| **Sentry** | Error tracking | $26/mes (plan team) o gratis (5k eventos/mes) |
| **LogRocket** | Session replay | $99/mes o gratis (1k sesiones/mes) |
| **Uptime Robot** | Monitoring uptime | Gratis (50 monitores) |

---

## 6. CRONOGRAMA TÉCNICO DE IMPLEMENTACIÓN

### Fase 1: Setup y Base (Semanas 1-2)
- Configurar repositorio Git
- Setup frontend (Vite + React + TS)
- Setup backend (Node.js + Express + TS)
- Configurar base de datos (Prisma + PostgreSQL)
- Configurar almacenamiento S3
- Implementar autenticación básica

### Fase 2: Gestión de Productos (Semanas 3-5)
- CRUD de productos
- Importación CSV
- Sistema de categorías
- Búsqueda y filtros
- Edición masiva

### Fase 3: Gestión de Imágenes (Semanas 6-8)
- Carga y almacenamiento
- Galería de imágenes
- Editor de imágenes básico
- Integración con productos

### Fase 4: Editor Visual Avanzado (Semanas 9-11)
- Canvas de edición
- Capas y efectos
- Texto y formas
- Guardado de versiones

### Fase 5: Catálogos (Semanas 12-15)
- Creación de catálogos
- Selección de productos
- Layouts predefinidos
- Editor visual de layout
- Vista previa

### Fase 6: Generación PDF (Semanas 16-17)
- Generador de PDF con Puppeteer
- Cola de trabajos `pdf_jobs` para procesamiento asíncrono
- Worker que procesa un trabajo a la vez para controlar uso de memoria
- Polling desde el frontend para consultar estado del trabajo (pending → processing → completed/failed)
- Múltiples layouts y configuración de estilos

### Fase 7: Guest Access (Semana 18)
- Creación y gestión de cuentas Guest
- Habilitación/deshabilitación de catálogos para Guests
- Vista de empleado rutero (panel Guest)

### Fase 8: Testing y Deploy (Semanas 19-20)
- Testing integral
- Corrección de bugs
- Optimización de rendimiento
- Deploy a producción
- Documentación final

---

## 7. RIESGOS TÉCNICOS Y MITIGACIÓN

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Editor visual muy complejo** | Alta | Alto | Usar librerías probadas (Fabric.js), MVP con funcionalidades básicas primero |
| **Generación PDF lenta / timeout** | Media | Alto | Cola de trabajos asíncrona (`pdf_jobs`) implementada desde Fase 6; worker de un proceso a la vez; PDFs almacenados en nube para re-descarga sin regenerar |
| **Escalabilidad de imágenes** | Media | Medio | CDN desde inicio, optimización automática, lazy loading |
| **Costos de hosting superan presupuesto** | Baja | Medio | Monitoreo constante, alertas de costos, plan de migración |
| **Curva de aprendizaje TypeScript** | Media | Bajo | Documentación y tutoriales, pair programming |
| **Compatibilidad de navegadores** | Baja | Bajo | Testing en múltiples navegadores, polyfills |

---

## 8. JUSTIFICACIÓN DE DECISIONES TÉCNICAS

### ¿Por qué React y no Vue o Angular?

| Framework | Pros | Contras | Decisión |
|-----------|------|---------|----------|
| **React** | Mayor ecosistema, más librerías, comunidad enorme | Menos opinado, más decisiones |  **Seleccionado** |
| **Vue 3** | Más fácil de aprender, menos boilerplate | Menos librerías especializadas |  |
| **Angular** | Framework completo, muy estructurado | Curva de aprendizaje muy alta |  |

---

### ¿Por qué Node.js y no Python/Django o PHP/Laravel?

| Backend | Pros | Contras | Decisión |
|---------|------|---------|----------|
| **Node.js** | JavaScript full-stack, rendimiento I/O, async nativo | Single-threaded |  **Seleccionado** |
| **Python/Django** | Excelente para ML, sintaxis limpia | Menor rendimiento para I/O |  |
| **PHP/Laravel** | Hosting económico, maduro | Menos moderno, menor rendimiento |  |

---

### ¿Por qué PostgreSQL y no MySQL o MongoDB?

| Database | Pros | Contras | Decisión |
|----------|------|---------|----------|
| **PostgreSQL** | JSON support, robustez, features avanzados | Configuración inicial compleja |  **Seleccionado** |
| **MySQL** | Simple, muy usado | Menos features avanzados |  |
| **MongoDB** | Flexible (NoSQL), escalable | Pérdida de relaciones estructuradas |  |

**Justificación:** Los datos son altamente relacionales (productos ↔ categorías ↔ catálogos), PostgreSQL ofrece lo mejor de ambos mundos (relacional + JSON).

---

## 9. PRÓXIMOS PASOS

1. **Aprobación de arquitectura y stack** por parte de Aljaba S.A.
2. **Setup de repositorio Git** (GitHub privado)
3. **Creación de diagramas UML** detallados
4. **Configuración de entornos** (desarrollo, staging, producción)
5. **Inicio de Fase 1** de desarrollo

---

**Última actualización:** 14 de febrero de 2026  
**Versión:** 1.0
