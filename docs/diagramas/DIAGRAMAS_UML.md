# Diagramas UML - Catalog Aljaba

## Índice de Diagramas

1. [Diagrama de Casos de Uso](#1-diagrama-de-casos-de-uso)
2. [Diagrama de Clases](#2-diagrama-de-clases)
3. [Diagrama de Secuencia - Importar CSV](#3-diagrama-de-secuencia-importar-csv)
4. [Diagrama de Secuencia - Generar Catálogo PDF](#4-diagrama-de-secuencia-generar-catálogo-pdf)
5. [Diagrama de Secuencia - Acceso Guest](#5-diagrama-de-secuencia-acceso-guest)
6. [Diagrama de Componentes](#6-diagrama-de-componentes)
7. [Diagrama de Despliegue](#7-diagrama-de-despliegue)
8. [Diagrama de Actividades - Flujo Completo](#8-diagrama-de-actividades-flujo-completo)
9. [Diagrama Entidad-Relación (Base de Datos)](#9-diagrama-entidad-relación)

---

## 1. Diagrama de Casos de Uso

### Descripción
Muestra las interacciones principales entre los actores (Admin y Guest) y el sistema.

```mermaid
graph TB
    subgraph "Sistema Catalog Aljaba"
        UC1[Gestionar Autenticación]
        UC2[Importar CSV]
        UC3[Gestionar Productos]
        UC4[Gestionar Categorías]
        UC5[Cargar Imágenes]
        UC6[Editar Imágenes]
        UC7[Crear Catálogo]
        UC8[Diseñar Layout Catálogo]
        UC9[Generar PDF]
        UC10[Compartir Catálogo]
        UC11[Visualizar Catálogo]
        UC12[Descargar PDF]
        UC13[Buscar y Filtrar Productos]
        UC14[Edición Masiva de Productos]
    end
    
    Admin((Administrador))
    Guest((Cliente Guest))
    
    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC4
    Admin --> UC5
    Admin --> UC6
    Admin --> UC7
    Admin --> UC8
    Admin --> UC9
    Admin --> UC10
    Admin --> UC13
    Admin --> UC14
    
    Guest --> UC11
    Guest --> UC12
    
    UC2 -.incluye.-> UC3
    UC7 -.incluye.-> UC13
    UC8 -.incluye.-> UC6
    UC9 -.requiere.-> UC8
    UC10 -.genera.-> UC11
```

### Casos de Uso Principales

| ID | Caso de Uso | Actor | Descripción |
|----|-------------|-------|-------------|
| UC1 | Gestionar Autenticación | Admin | Login, logout, recuperación de contraseña |
| UC2 | Importar CSV | Admin | Carga masiva de productos desde archivo CSV |
| UC3 | Gestionar Productos | Admin | CRUD completo de productos |
| UC4 | Gestionar Categorías | Admin | Crear y organizar categorías |
| UC5 | Cargar Imágenes | Admin | Subir imágenes al sistema |
| UC6 | Editar Imágenes | Admin | Edición avanzada con capas y efectos |
| UC7 | Crear Catálogo | Admin | Iniciar nuevo catálogo |
| UC8 | Diseñar Layout Catálogo | Admin | Personalizar apariencia del catálogo |
| UC9 | Generar PDF | Admin | Exportar catálogo a PDF |
| UC10 | Compartir Catálogo | Admin | Generar enlace de acceso para guests |
| UC11 | Visualizar Catálogo | Guest | Ver catálogo compartido |
| UC12 | Descargar PDF | Guest | Descargar catálogo en PDF |
| UC13 | Buscar y Filtrar | Admin | Búsqueda avanzada de productos |
| UC14 | Edición Masiva | Admin | Modificar múltiples productos simultáneamente |

---

## 2. Diagrama de Clases

### Descripción
Estructura de las clases principales del sistema y sus relaciones.

```mermaid
classDiagram
    class User {
        +UUID id
        +String email
        +String passwordHash
        +String name
        +Role role
        +DateTime createdAt
        +login()
        +logout()
        +resetPassword()
    }
    
    class Role {
        <<enumeration>>
        ADMIN
        GUEST
    }
    
    class Product {
        +UUID id
        +String name
        +String code
        +String description
        +UUID categoryId
        +Decimal price1
        +Decimal price2
        +Decimal price3
        +Decimal price4
        +Decimal price5
        +Decimal price6
        +Integer stock
        +UUID imageId
        +DateTime createdAt
        +DateTime updatedAt
        +create()
        +update()
        +delete()
        +search()
    }
    
    class Category {
        +UUID id
        +String name
        +UUID parentId
        +DateTime createdAt
        +getChildren()
        +getParent()
        +getFullPath()
    }
    
    class Image {
        +UUID id
        +String filename
        +String originalUrl
        +String thumbnailUrl
        +String s3Key
        +Integer sizeBytes
        +Integer width
        +Integer height
        +DateTime createdAt
        +upload()
        +delete()
        +optimize()
        +edit()
    }
    
    class Catalog {
        +UUID id
        +String name
        +String description
        +JSON config
        +UUID createdBy
        +DateTime createdAt
        +DateTime updatedAt
        +addProduct()
        +removeProduct()
        +generatePDF()
        +share()
    }
    
    class CatalogProduct {
        +UUID id
        +UUID catalogId
        +UUID productId
        +Integer position
        +reorder()
    }
    
    class SharedLink {
        +UUID id
        +UUID token
        +UUID catalogId
        +JSON permissions
        +DateTime expiresAt
        +String passwordHash
        +UUID createdBy
        +DateTime createdAt
        +validate()
        +revoke()
    }
    
    class PDFGenerator {
        +generateFromCatalog()
        +applyLayout()
        +renderPage()
        +compress()
    }
    
    class ImageEditor {
        +crop()
        +rotate()
        +resize()
        +applyFilter()
        +addLayer()
        +applyMask()
    }
    
    User "1" -- "0..*" Product : creates
    User "1" -- "0..*" Catalog : creates
    User "1" -- "0..*" SharedLink : creates
    User "1" -- "1" Role : has
    
    Product "*" -- "1" Category : belongsTo
    Product "1" -- "0..1" Image : has
    
    Category "0..*" -- "0..1" Category : parent
    
    Catalog "1" -- "*" CatalogProduct : contains
    CatalogProduct "*" -- "1" Product : references
    
    Catalog "1" -- "0..*" SharedLink : sharedVia
    
    Catalog ..> PDFGenerator : uses
    Image ..> ImageEditor : uses
```

### Explicación de Relaciones

- **User ← Product/Catalog/SharedLink:** Un usuario Admin crea productos, catálogos y enlaces compartidos.
- **Product → Category:** Cada producto pertenece a una categoría.
- **Product → Image:** Cada producto puede tener una imagen asociada.
- **Category ↔ Category:** Relación auto-referencial para jerarquía (árbol de categorías).
- **Catalog ↔ Product (through CatalogProduct):** Relación muchos-a-muchos entre catálogos y productos.
- **Catalog → SharedLink:** Un catálogo puede tener múltiples enlaces compartidos.

---

## 3. Diagrama de Secuencia: Importar CSV

### Descripción
Flujo de importación de productos desde archivo CSV.

```mermaid
sequenceDiagram
    actor Admin
    participant Frontend
    participant Backend
    participant CSVService
    participant ProductService
    participant Database
    
    Admin->>Frontend: Selecciona archivo CSV
    Frontend->>Backend: POST /api/products/import (CSV file)
    Backend->>CSVService: validateCSVStructure(file)
    
    alt Estructura inválida
        CSVService-->>Backend: Error: estructura incorrecta
        Backend-->>Frontend: 400 Bad Request
        Frontend-->>Admin: Mostrar errores de validación
    else Estructura válida
        CSVService->>CSVService: parseCSV(file)
        CSVService->>CSVService: validateRows()
        CSVService-->>Backend: Reporte de validación
        Backend-->>Frontend: 200 OK + Reporte
        Frontend-->>Admin: Mostrar reporte (errores/advertencias)
        
        Admin->>Frontend: Confirma importación
        Frontend->>Backend: POST /api/products/import/confirm
        
        loop Para cada producto válido
            Backend->>ProductService: createOrUpdateProduct(productData)
            ProductService->>Database: INSERT/UPDATE product
            Database-->>ProductService: OK
        end
        
        Backend-->>Frontend: 200 OK + Resumen
        Frontend-->>Admin: Mostrar resumen de importación
    end
```

### Flujo Alternativo: Producto Duplicado

```mermaid
sequenceDiagram
    participant CSVService
    participant ProductService
    participant Database
    participant Admin
    
    CSVService->>ProductService: createOrUpdateProduct(productData)
    ProductService->>Database: SELECT * FROM products WHERE code = ?
    
    alt Producto existe
        Database-->>ProductService: Product found
        ProductService-->>CSVService: ProductExists error
        CSVService-->>Admin: ¿Actualizar o omitir?
        
        alt Actualizar
            Admin->>ProductService: Update existing
            ProductService->>Database: UPDATE product
        else Omitir
            Admin->>ProductService: Skip
            ProductService-->>CSVService: Skipped
        end
    else Producto nuevo
        Database-->>ProductService: Not found
        ProductService->>Database: INSERT product
    end
```

---

## 4. Diagrama de Secuencia: Generar Catálogo PDF

### Descripción
Proceso de generación de PDF desde catálogo diseñado.

```mermaid
sequenceDiagram
    actor Admin
    participant Frontend
    participant Backend
    participant CatalogService
    participant PDFGenerator
    participant S3Service
    participant Database
    
    Admin->>Frontend: Click "Generar PDF"
    Frontend->>Backend: POST /api/catalogs/:id/generate-pdf
    Backend->>CatalogService: getCatalogWithProducts(catalogId)
    CatalogService->>Database: SELECT catalog + products
    Database-->>CatalogService: Catalog data + products
    
    CatalogService->>PDFGenerator: generate(catalog, config)
    
    loop Para cada página del catálogo
        PDFGenerator->>PDFGenerator: renderPage(products, layout)
        PDFGenerator->>S3Service: getSignedImageUrls(imageIds)
        S3Service-->>PDFGenerator: Image URLs
        PDFGenerator->>PDFGenerator: embedImages()
    end
    
    PDFGenerator->>PDFGenerator: compilePDF()
    PDFGenerator->>PDFGenerator: compress()
    PDFGenerator-->>CatalogService: PDF Buffer
    
    CatalogService->>S3Service: uploadPDF(pdfBuffer, filename)
    S3Service->>S3Service: PUT to S3 bucket
    S3Service-->>CatalogService: S3 URL
    
    CatalogService->>Database: UPDATE catalog SET pdf_url = ?
    Database-->>CatalogService: OK
    
    CatalogService-->>Backend: PDF URL
    Backend-->>Frontend: 200 OK + PDF URL
    Frontend-->>Admin: Mostrar enlace de descarga
```

### Manejo de Error

```mermaid
sequenceDiagram
    participant PDFGenerator
    participant Backend
    participant Frontend
    participant Admin
    
    PDFGenerator->>PDFGenerator: generate()
    
    alt Error en generación
        PDFGenerator-->>Backend: Error: Timeout / Out of Memory
        Backend-->>Frontend: 500 Internal Server Error
        Frontend-->>Admin: "Error al generar PDF. Intente de nuevo."
    else Éxito
        PDFGenerator-->>Backend: PDF Buffer
        Backend-->>Frontend: 200 OK
    end
```

---

## 5. Diagrama de Secuencia: Acceso Guest

### Descripción
Flujo de acceso de un usuario Guest a catálogo compartido.

```mermaid
sequenceDiagram
    actor Guest
    participant Browser
    participant Backend
    participant SharedLinkService
    participant CatalogService
    participant Database
    
    Guest->>Browser: Accede a URL: /shared/:token
    Browser->>Backend: GET /api/shared/:token
    
    Backend->>SharedLinkService: validateToken(token)
    SharedLinkService->>Database: SELECT * FROM shared_links WHERE token = ?
    
    alt Token no existe
        Database-->>SharedLinkService: Not found
        SharedLinkService-->>Backend: Invalid token
        Backend-->>Browser: 404 Not Found
        Browser-->>Guest: "Enlace no válido"
    else Token existe
        Database-->>SharedLinkService: SharedLink data
        SharedLinkService->>SharedLinkService: checkExpiration()
        
        alt Token expirado
            SharedLinkService-->>Backend: Token expired
            Backend-->>Browser: 403 Forbidden
            Browser-->>Guest: "Enlace expirado"
        else Token válido
            alt Requiere contraseña
                SharedLinkService-->>Backend: Password required
                Backend-->>Browser: 401 Unauthorized
                Browser-->>Guest: Solicita contraseña
                Guest->>Browser: Ingresa contraseña
                Browser->>Backend: POST /api/shared/:token/auth
                Backend->>SharedLinkService: validatePassword(password)
                
                alt Contraseña incorrecta
                    SharedLinkService-->>Backend: Invalid password
                    Backend-->>Browser: 401 Unauthorized
                    Browser-->>Guest: "Contraseña incorrecta"
                else Contraseña correcta
                    SharedLinkService-->>Backend: OK
                end
            end
            
            Backend->>CatalogService: getCatalog(catalogId)
            CatalogService->>Database: SELECT catalog + products
            Database-->>CatalogService: Catalog data
            CatalogService-->>Backend: Catalog
            Backend-->>Browser: 200 OK + Catalog + Permissions
            Browser-->>Guest: Renderiza catálogo
        end
    end
```

---

## 6. Diagrama de Componentes

### Descripción
Arquitectura de componentes del sistema, mostrando módulos principales y sus dependencias.

```mermaid
graph TB
    subgraph "Frontend - React SPA"
        A[App Router]
        B[Auth Module]
        C[Products Module]
        D[Catalogs Module]
        E[Image Editor Module]
        F[Guest View Module]
        G[Shared Components]
        H[State Management Zustand]
        I[API Client Axios]
        
        A --> B
        A --> C
        A --> D
        A --> E
        A --> F
        C --> G
        D --> G
        E --> G
        F --> G
        B --> H
        C --> H
        D --> H
        B --> I
        C --> I
        D --> I
        E --> I
        F --> I
    end
    
    subgraph "Backend - Node.js API"
        J[Express Server]
        K[Auth Routes]
        L[Products Routes]
        M[Catalogs Routes]
        N[Images Routes]
        O[Shared Routes]
        
        P[Auth Service]
        Q[Products Service]
        R[Catalogs Service]
        S[Images Service]
        T[CSV Service]
        U[PDF Generator Service]
        V[S3 Service]
        
        W[Auth Middleware]
        X[Validation Middleware]
        
        J --> K
        J --> L
        J --> M
        J --> N
        J --> O
        
        K --> P
        L --> Q
        M --> R
        N --> S
        L --> T
        M --> U
        
        K --> W
        L --> W
        M --> W
        N --> W
        
        K --> X
        L --> X
        M --> X
        N --> X
        
        S --> V
        U --> V
    end
    
    subgraph "Data Layer"
        Y[(PostgreSQL)]
        Z[AWS S3 / Spaces]
    end
    
    I -.HTTP/REST.-> J
    P --> Y
    Q --> Y
    R --> Y
    S --> Y
    V --> Z
```

### Explicación de Componentes

#### Frontend
- **App Router:** Enrutamiento de la SPA (React Router)
- **Auth Module:** Login, registro, recuperación de contraseña
- **Products Module:** CRUD de productos, búsqueda, filtros, edición masiva
- **Catalogs Module:** Creación y diseño de catálogos
- **Image Editor Module:** Editor visual de imágenes
- **Guest View Module:** Vista simplificada para usuarios invitados
- **Shared Components:** Botones, inputs, cards, modales reutilizables
- **State Management:** Zustand para estado global de la app
- **API Client:** Axios configurado con interceptores y manejo de errores

#### Backend
- **Express Server:** Servidor HTTP principal
- **Routes:** Definición de endpoints REST
- **Services:** Lógica de negocio y comunicación con base de datos
- **Middlewares:** Autenticación JWT, validación de inputs, rate limiting

#### Data Layer
- **PostgreSQL:** Base de datos relacional para datos estructurados
- **S3/Spaces:** Almacenamiento de imágenes y PDFs generados

---

## 7. Diagrama de Despliegue

### Descripción
Infraestructura física y lógica donde se desplegará el sistema.

```mermaid
graph TB
    subgraph "Internet"
        U[Usuarios]
    end
    
    subgraph "Cloudflare CDN"
        CF[CDN + DDoS Protection]
    end
    
    subgraph "DigitalOcean App Platform"
        subgraph "Frontend Container"
            FE[React Build Static Files]
        end
        
        subgraph "Backend Container"
            BE[Node.js API Server]
        end
    end
    
    subgraph "DigitalOcean Managed Services"
        DB[(PostgreSQL Database)]
        SP[Spaces - S3 Compatible Storage]
    end
    
    subgraph "GitHub"
        REPO[Git Repository]
        ACTIONS[GitHub Actions CI/CD]
    end
    
    U -->|HTTPS| CF
    CF -->|Cache static| FE
    CF -->|API requests| BE
    BE -->|SQL queries| DB
    BE -->|Store/retrieve files| SP
    FE -.->|Serve images| SP
    
    REPO -->|Trigger on push| ACTIONS
    ACTIONS -->|Deploy| FE
    ACTIONS -->|Deploy| BE
```

### Especificaciones Técnicas

#### Frontend (Static Hosting)
- **Plataforma:** DigitalOcean App Platform (Static Site)
- **Recursos:** CDN global incluido
- **Costo:** Gratis (incluido en plan)

#### Backend (Containerized App)
- **Plataforma:** DigitalOcean App Platform (Web Service)
- **Recursos:** 1GB RAM, 1 vCPU
- **Runtime:** Node.js 20 LTS
- **Costo:** $12/mes

#### Base de Datos
- **Servicio:** DigitalOcean Managed PostgreSQL
- **Recursos:** 1GB RAM, 10GB storage, 10 conexiones
- **Backups:** Automático diario incluido
- **Costo:** $15/mes

#### Almacenamiento
- **Servicio:** DigitalOcean Spaces (S3-compatible)
- **Recursos:** 50GB storage + CDN
- **Transferencia:** 1TB bandwidth incluido
- **Costo:** $5/mes

#### CI/CD
- **Plataforma:** GitHub Actions
- **Trigger:** Push a rama `main`
- **Acciones:** Lint → Test → Build → Deploy
- **Costo:** Gratis (plan estándar)

---

## 8. Diagrama de Actividades: Flujo Completo

### Descripción
Flujo end-to-end desde importación hasta descarga de catálogo por Guest.

```mermaid
flowchart TD
    Start([Inicio]) --> A[Admin inicia sesión]
    A --> B{Productos<br/>existen?}
    
    B -->|No| C[Importar CSV]
    B -->|Sí| D[Gestionar productos]
    
    C --> C1[Subir archivo CSV]
    C1 --> C2[Validar estructura]
    C2 --> C3{¿Válido?}
    
    C3 -->|No| C4[Mostrar errores]
    C4 --> C1
    C3 -->|Sí| C5[Importar productos]
    C5 --> D
    
    D --> D1[Buscar/filtrar productos]
    D1 --> D2{¿Editar<br/>imágenes?}
    
    D2 -->|Sí| E[Abrir editor de imágenes]
    D2 -->|No| F
    
    E --> E1[Aplicar efectos y capas]
    E1 --> E2[Guardar imagen editada]
    E2 --> F[Crear nuevo catálogo]
    
    F --> F1[Seleccionar productos]
    F1 --> F2[Elegir layout]
    F2 --> F3[Personalizar diseño]
    F3 --> F4[Vista previa]
    F4 --> F5{¿Diseño OK?}
    
    F5 -->|No| F3
    F5 -->|Sí| G[Generar PDF]
    
    G --> G1[Renderizar páginas]
    G1 --> G2[Compilar PDF]
    G2 --> G3[Almacenar en S3]
    G3 --> H[Generar enlace compartido]
    
    H --> H1[Configurar permisos]
    H1 --> H2[Copiar enlace]
    H2 --> I[Enviar enlace a cliente]
    
    I --> J[Cliente Guest accede]
    J --> J1{¿Enlace<br/>válido?}
    
    J1 -->|No| J2[Mostrar error]
    J1 -->|Sí| J3{¿Requiere<br/>contraseña?}
    
    J3 -->|Sí| J4[Ingresar contraseña]
    J4 --> J5{¿Correcta?}
    J5 -->|No| J4
    J5 -->|Sí| K
    J3 -->|No| K[Visualizar catálogo]
    
    K --> L{¿Tiene permiso<br/>descarga?}
    L -->|Sí| M[Descargar PDF]
    L -->|No| N[Solo visualizar]
    
    M --> End([Fin])
    N --> End
    J2 --> End
```

---

## 9. Diagrama Entidad-Relación (Base de Datos)

### Descripción
Modelo de datos detallado de la base de datos PostgreSQL.

```mermaid
erDiagram
    USERS ||--o{ PRODUCTS : creates
    USERS ||--o{ CATALOGS : creates
    USERS ||--o{ SHARED_LINKS : creates
    USERS ||--|| ROLES : has
    
    PRODUCTS }o--|| CATEGORIES : "belongs to"
    PRODUCTS }o--o| IMAGES : "has"
    
    CATEGORIES }o--o| CATEGORIES : "parent of"
    
    CATALOGS ||--o{ CATALOG_PRODUCTS : contains
    CATALOG_PRODUCTS }o--|| PRODUCTS : references
    
    CATALOGS ||--o{ SHARED_LINKS : "shared via"
    
    USERS {
        uuid id PK
        varchar email UK
        varchar password_hash
        varchar name
        enum role
        timestamp created_at
    }
    
    ROLES {
        string ADMIN
        string GUEST
    }
    
    CATEGORIES {
        uuid id PK
        varchar name
        uuid parent_id FK
        timestamp created_at
    }
    
    PRODUCTS {
        uuid id PK
        varchar name
        varchar code UK
        text description
        uuid category_id FK
        decimal price1
        decimal price2
        decimal price3
        decimal price4
        decimal price5
        decimal price6
        integer stock
        uuid image_id FK
        timestamp created_at
        timestamp updated_at
    }
    
    IMAGES {
        uuid id PK
        varchar filename
        varchar original_url
        varchar thumbnail_url
        varchar s3_key
        integer size_bytes
        integer width
        integer height
        timestamp created_at
    }
    
    CATALOGS {
        uuid id PK
        varchar name
        text description
        jsonb config
        uuid created_by FK
        timestamp created_at
        timestamp updated_at
    }
    
    CATALOG_PRODUCTS {
        uuid id PK
        uuid catalog_id FK
        uuid product_id FK
        integer position
    }
    
    SHARED_LINKS {
        uuid id PK
        uuid token UK
        uuid catalog_id FK
        jsonb permissions
        timestamp expires_at
        varchar password_hash
        uuid created_by FK
        timestamp created_at
    }
```

### Índices

```sql
-- Índices para búsqueda rápida
CREATE INDEX idx_products_code ON products(code);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- Índices para categorías (árbol)
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- Índices para catálogos
CREATE INDEX idx_catalogs_created_by ON catalogs(created_by);
CREATE INDEX idx_catalog_products_catalog ON catalog_products(catalog_id);
CREATE INDEX idx_catalog_products_product ON catalog_products(product_id);

-- Índices para shared links
CREATE INDEX idx_shared_links_token ON shared_links(token);
CREATE INDEX idx_shared_links_catalog ON shared_links(catalog_id);
CREATE INDEX idx_shared_links_expires ON shared_links(expires_at);

-- Índice para búsqueda full-text 
CREATE INDEX idx_products_search ON products USING GIN(to_tsvector('spanish', name || ' ' || description));
```

---

## 10. Diagrama de Estados: Catálogo

### Descripción
Ciclo de vida de un catálogo desde creación hasta compartido.

```mermaid
stateDiagram-v2
    [*] --> Borrador: Admin crea catálogo
    
    Borrador --> EnEdicion: Admin agrega productos
    EnEdicion --> EnEdicion: Admin modifica layout
    EnEdicion --> Borrador: Admin elimina todos los productos
    
    EnEdicion --> Generando: Admin solicita generar PDF
    
    Generando --> Completado: PDF generado exitosamente
    Generando --> Error: Fallo en generación
    
    Error --> EnEdicion: Admin corrige y reintenta
    
    Completado --> Compartido: Admin genera enlace
    Compartido --> Compartido: Admin genera más enlaces
    
    Completado --> EnEdicion: Admin edita catálogo
    Compartido --> EnEdicion: Admin edita catálogo
    
    EnEdicion --> Archivado: Admin archiva
    Completado --> Archivado: Admin archiva
    Compartido --> Archivado: Admin archiva
    
    Archivado --> [*]
    
    note right of Borrador
        Sin productos asignados
    end note
    
    note right of EnEdicion
        Tiene productos
        pero sin PDF generado
    end note
    
    note right of Completado
        PDF generado y almacenado
    end note
    
    note right of Compartido
        Enlaces activos
        Guests pueden acceder
    end note
```

---

## 11. Diagrama de Paquetes: Estructura del Backend

### Descripción
Organización de módulos y paquetes del backend.

```mermaid
graph TB
    subgraph "Backend Application"
        subgraph "Presentation Layer"
            A[Routes]
            B[Controllers]
            C[Middlewares]
        end
        
        subgraph "Business Logic Layer"
            D[Services]
            E[Validators]
            F[DTOs]
        end
        
        subgraph "Data Access Layer"
            G[Prisma Client]
            H[Repositories]
        end
        
        subgraph "External Services"
            I[S3 Service]
            J[PDF Generator]
            K[Image Processor]
        end
        
        subgraph "Utilities"
            L[Logger]
            M[Error Handler]
            N[Config]
        end
    end
    
    A --> B
    B --> D
    C --> B
    D --> E
    D --> F
    D --> H
    D --> I
    D --> J
    D --> K
    H --> G
    B --> L
    B --> M
    D --> L
    A --> N
    
    G -.-> DB[(PostgreSQL)]
    I -.-> S3[(AWS S3)]
```

---

## Resumen de Diagramas

|  #  |     Diagrama     |           Propósito              |           Audiencia          |
|-----|------------------|----------------------------------|------------------------------|
|  1  | Casos de Uso     | Funcionalidades del sistema      | Stakeholders, Product Owner  |
|  2  | Clases           | Estructura de datos y relaciones | Desarrolladores              |
| 3-5 | Secuencia        | Flujos de interacción detallados | Desarrolladores, Testers     |
|  6  | Componentes      | Arquitectura de software         | Arquitecto, Desarrolladores  |
|  7  | Despliegue       | Infraestructura física           | DevOps, Infraestructura      |
|  8  | Actividades      | Flujo end-to-end                 | Todos                        |
|  9  | Entidad-Relación | Modelo de base de datos          | DBA, Desarrolladores Backend |
|  10 | Estados          | Ciclo de vida de entidades       | Desarrolladores, QA          |
|  11 | Paquetes         | Organización de código           | Desarrolladores              |

---

**Última actualización:** 12 de febrero de 2026  
**Versión:** 1.0
