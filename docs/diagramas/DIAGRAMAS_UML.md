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

### Descripcion
Muestra las interacciones principales entre los actores (Admin y Empleado Rutero/Guest) y el sistema.

```mermaid
graph TB
    subgraph "Sistema Catalog Aljaba"
        UC1[Gestionar Autenticacion]
        UC2[Importar CSV]
        UC3[Gestionar Productos]
        UC4[Gestionar Categorias y Categorias Padre]
        UC5[Cargar Imagenes]
        UC6[Editar Imagenes]
        UC7[Crear Catalogo]
        UC8[Disenar Layout Catalogo]
        UC9[Generar PDF]
        UC10[Habilitar Catalogo para Guests]
        UC11[Visualizar Catalogos Habilitados]
        UC12[Descargar PDF]
        UC13[Buscar y Filtrar Productos]
        UC14[Edicion Masiva de Productos]
        UC15[Gestionar Cuentas Guest]
    end

    Admin((Administrador))
    Guest((Empleado Rutero))

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
    Admin --> UC15

    Guest --> UC1
    Guest --> UC11
    Guest --> UC12

    UC2 -.incluye.-> UC3
    UC5 -.previa a.-> UC2
    UC7 -.incluye.-> UC13
    UC8 -.incluye.-> UC6
    UC9 -.requiere.-> UC8
    UC10 -.habilita.-> UC11
```

### Casos de Uso Principales

| ID | Caso de Uso | Actor | Descripcion |
|----|-------------|-------|-------------|
| UC1 | Gestionar Autenticacion | Admin, Guest | Login y logout con usuario y contrasena |
| UC2 | Importar CSV | Admin | Carga masiva de productos desde archivo CSV (11 columnas) |
| UC3 | Gestionar Productos | Admin | CRUD completo de productos |
| UC4 | Gestionar Categorias y Categorias Padre | Admin | Crear categorias, subcategorias y categorias padre que agrupan categorias |
| UC5 | Cargar Imagenes | Admin | Subir imagenes al sistema con nombre igual al code del producto |
| UC6 | Editar Imagenes | Admin | Edicion avanzada con capas y efectos |
| UC7 | Crear Catalogo | Admin | Iniciar nuevo catalogo |
| UC8 | Disenar Layout Catalogo | Admin | Personalizar apariencia del catalogo |
| UC9 | Generar PDF | Admin | Exportar catalogo a PDF |
| UC10 | Habilitar Catalogo para Guests | Admin | Activar o desactivar visibilidad de un catalogo para todos los Guests |
| UC11 | Visualizar Catalogos Habilitados | Guest | Ver los catalogos que el Admin ha habilitado |
| UC12 | Descargar PDF | Guest | Descargar el PDF de un catalogo habilitado |
| UC13 | Buscar y Filtrar Productos | Admin | Busqueda avanzada y filtros multiples |
| UC14 | Edicion Masiva de Productos | Admin | Modificar multiples productos simultaneamente |
| UC15 | Gestionar Cuentas Guest | Admin | Crear, editar y desactivar cuentas de empleados ruteros |

---

## 2. Diagrama de Clases

### Descripcion
Estructura de las clases principales del sistema y sus relaciones.

```mermaid
classDiagram
    class User {
        +UUID id
        +String username
        +String passwordHash
        +String name
        +Role role
        +Boolean active
        +DateTime createdAt
        +login()
        +logout()
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

    class ParentCategory {
        +UUID id
        +String name
        +DateTime createdAt
        +addCategory()
        +removeCategory()
        +rename()
        +delete()
    }

    class Category {
        +UUID id
        +String name
        +UUID parentCategoryId
        +UUID parentId
        +DateTime createdAt
        +getChildren()
        +getParent()
    }

    class Image {
        +UUID id
        +String originalFilename
        +String url
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
        +Boolean guestVisible
        +UUID createdBy
        +DateTime createdAt
        +DateTime updatedAt
        +addProduct()
        +removeProduct()
        +generatePDF()
        +setGuestVisibility()
    }

    class CatalogProduct {
        +UUID id
        +UUID catalogId
        +UUID productId
        +Integer position
        +reorder()
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
    User "1" -- "1" Role : has

    Product "*" -- "1" Category : belongsTo
    Product "1" -- "0..1" Image : has

    ParentCategory "1" -- "0..*" Category : groups
    Category "0..*" -- "0..1" Category : parent

    Catalog "1" -- "*" CatalogProduct : contains
    CatalogProduct "*" -- "1" Product : references

    Catalog ..> PDFGenerator : uses
    Image ..> ImageEditor : uses
```

### Explicacion de Relaciones

- **User - Product/Catalog:** Un usuario Admin crea productos y catalogos.
- **Product - Category:** Cada producto pertenece a una categoria.
- **Product - Image:** Cada producto puede tener una imagen asociada. La vinculacion se hace por nombre de archivo.
- **ParentCategory - Category:** Una categoria padre agrupa multiples categorias. La relacion es de total disposicion del Admin.
- **Category - Category:** Relacion auto-referencial para subcategorias.
- **Catalog - Product (a traves de CatalogProduct):** Relacion muchos-a-muchos.
- **Catalog.guestVisible:** Campo booleano que controla si el catalogo es visible para todos los Guests autenticados. No hay enlaces individuales ni expiracion.

---

## 3. Diagrama de Secuencia: Importar CSV

### Descripcion
Flujo de importacion de productos desde archivo CSV, incluyendo la vinculacion automatica de imagenes por nombre.

```mermaid
sequenceDiagram
    actor Admin
    participant Frontend
    participant Backend
    participant CSVService
    participant ImageService
    participant ProductService
    participant Database

    Admin->>Frontend: Selecciona archivo CSV
    Frontend->>Backend: POST /api/products/import (CSV file)
    Backend->>CSVService: validateCSVStructure(file)

    alt Estructura invalida (columnas incorrectas o columna image presente)
        CSVService-->>Backend: Error: estructura incorrecta
        Backend-->>Frontend: 400 Bad Request
        Frontend-->>Admin: Mostrar errores de validacion
    else Estructura valida (11 columnas correctas)
        CSVService->>CSVService: parseCSV(file)
        CSVService->>Database: SELECT imagenes de la galeria
        Database-->>CSVService: Lista de imagenes disponibles

        loop Para cada fila del CSV
            CSVService->>CSVService: validateRow(row)
            CSVService->>ImageService: buscarImagenPorNombre(row.code)
            ImageService-->>CSVService: imagen encontrada / advertencia sin imagen
        end

        CSVService-->>Backend: Reporte de validacion
        Backend-->>Frontend: 200 OK + Reporte
        Frontend-->>Admin: Mostrar reporte con errores, advertencias e imagenes no encontradas

        Admin->>Frontend: Confirma importacion
        Frontend->>Backend: POST /api/products/import/confirm

        loop Para cada producto valido
            Backend->>ProductService: createOrUpdateProduct(productData, imageId)
            ProductService->>Database: INSERT/UPDATE product con imagen vinculada
            Database-->>ProductService: OK
        end

        Backend-->>Frontend: 200 OK + Resumen
        Frontend-->>Admin: Mostrar resumen (importados con imagen, sin imagen, omitidos)
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
        CSVService-->>Admin: Actualizar o ignorar?

        alt Actualizar
            Admin->>ProductService: Update existing
            ProductService->>Database: UPDATE product
        else Ignorar
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

## 5. Diagrama de Secuencia: Acceso Guest (Empleado Rutero)

### Descripcion
Flujo de acceso de un empleado rutero (Guest) al sistema para ver y descargar catalogos habilitados.

```mermaid
sequenceDiagram
    actor Guest as Empleado Rutero
    participant Browser
    participant Backend
    participant AuthService
    participant CatalogService
    participant Database

    Guest->>Browser: Ingresa usuario y contrasena
    Browser->>Backend: POST /api/auth/login
    Backend->>AuthService: authenticate(username, password)
    AuthService->>Database: SELECT user WHERE username = ?
    Database-->>AuthService: User data

    alt Credenciales invalidas o cuenta desactivada
        AuthService-->>Backend: Invalid credentials
        Backend-->>Browser: 401 Unauthorized
        Browser-->>Guest: "Usuario o contrasena incorrectos"
    else Credenciales validas
        AuthService->>AuthService: verifyPassword(hash)
        AuthService-->>Backend: JWT Token + role = GUEST
        Backend-->>Browser: 200 OK + Token
        Browser->>Browser: Guardar token en sesion

        Browser->>Backend: GET /api/catalogs?guestVisible=true
        Backend->>CatalogService: getCatalogsForGuest()
        CatalogService->>Database: SELECT catalogs WHERE guest_visible = true
        Database-->>CatalogService: Lista de catalogos habilitados
        CatalogService-->>Backend: Catalogs
        Backend-->>Browser: 200 OK + Catalogs
        Browser-->>Guest: Muestra lista de catalogos disponibles

        Guest->>Browser: Descarga PDF de un catalogo
        Browser->>Backend: GET /api/catalogs/:id/pdf
        Backend->>CatalogService: getPDF(catalogId)
        CatalogService->>Database: SELECT pdf_url WHERE guest_visible = true
        Database-->>CatalogService: PDF URL
        CatalogService-->>Backend: PDF file
        Backend-->>Browser: 200 OK + PDF
        Browser-->>Guest: Descarga iniciada
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

### Descripcion
Flujo end-to-end actualizado, desde carga de imagenes hasta descarga por el empleado rutero.

```mermaid
flowchart TD
    Start([Inicio]) --> A[Admin inicia sesion]
    A --> B{Productos existen?}

    B -->|No| C0[Subir imagenes al sistema]
    B -->|Si| D[Gestionar productos]

    C0 --> C0a[Nombrar cada imagen igual al code del producto]
    C0a --> C[Importar CSV]
    C --> C1[Subir archivo CSV de 11 columnas]
    C1 --> C2[Validar estructura]
    C2 --> C3{Valido?}

    C3 -->|No| C4[Mostrar errores]
    C4 --> C1
    C3 -->|Si| C5[Importar productos]
    C5 --> C6[Sistema vincula automaticamente imagenes por nombre]
    C6 --> D

    D --> D1[Buscar y filtrar productos]
    D1 --> D2{Editar imagenes?}

    D2 -->|Si| E[Abrir editor de imagenes]
    D2 -->|No| F
    E --> E1[Aplicar efectos y capas]
    E1 --> E2[Guardar imagen editada conservando nombre]
    E2 --> F[Crear nuevo catalogo]

    F --> F1[Seleccionar productos]
    F1 --> F2[Elegir layout]
    F2 --> F3[Personalizar diseno]
    F3 --> F4[Vista previa]
    F4 --> F5{Diseno OK?}

    F5 -->|No| F3
    F5 -->|Si| G[Generar PDF]

    G --> G1[Renderizar paginas]
    G1 --> G2[Compilar PDF]
    G2 --> G3[Almacenar en S3]
    G3 --> H[Habilitar catalogo para Guests]

    H --> H1[Admin activa toggle de visibilidad Guest]
    H1 --> I[Empleados ruteros ven el catalogo]

    I --> J[Guest inicia sesion con usuario y contrasena]
    J --> J1{Credenciales validas?}

    J1 -->|No| J2[Mostrar error de login]
    J1 -->|Si| K[Visualizar lista de catalogos habilitados]

    K --> L[Descargar PDF del catalogo]
    L --> M[Mostrar catalogo al cliente]

    M --> End([Fin])
    J2 --> End
```

---

## 9. Diagrama Entidad-Relacion (Base de Datos)

### Descripcion
Modelo de datos actualizado de la base de datos PostgreSQL.

```mermaid
erDiagram
    USERS ||--o{ PRODUCTS : creates
    USERS ||--o{ CATALOGS : creates
    USERS ||--|| ROLES : has

    PARENT_CATEGORIES ||--o{ CATEGORIES : groups

    PRODUCTS }o--|| CATEGORIES : "belongs to"
    PRODUCTS }o--o| IMAGES : "has"

    CATEGORIES }o--o| CATEGORIES : "parent of"

    CATALOGS ||--o{ CATALOG_PRODUCTS : contains
    CATALOG_PRODUCTS }o--|| PRODUCTS : references

    USERS {
        uuid id PK
        varchar username UK
        varchar password_hash
        varchar name
        enum role
        boolean active
        timestamp created_at
    }

    ROLES {
        string ADMIN
        string GUEST
    }

    PARENT_CATEGORIES {
        uuid id PK
        varchar name
        timestamp created_at
    }

    CATEGORIES {
        uuid id PK
        varchar name
        uuid parent_category_id FK
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
        varchar original_filename
        varchar url
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
        boolean guest_visible
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
```

### Cambios respecto a la version anterior

| Tabla | Cambio |
|-------|--------|
| `USERS` | `email` reemplazado por `username`; agregado campo `active` para desactivar cuentas Guest |
| `PARENT_CATEGORIES` | Tabla nueva para categorias padre que agrupan categorias |
| `CATEGORIES` | Agregado campo `parent_category_id` FK hacia `PARENT_CATEGORIES` |
| `IMAGES` | `filename` renombrado a `original_filename`; eliminado `original_url` (ya no se importan desde URL externa) |
| `CATALOGS` | Agregado campo `guest_visible` booleano; eliminada relacion con `SHARED_LINKS` |
| `SHARED_LINKS` | Tabla eliminada; la visibilidad Guest se controla con `catalogs.guest_visible` |

### Indices Recomendados

```sql
CREATE INDEX idx_products_code ON products(code);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_parent_category ON categories(parent_category_id);

CREATE INDEX idx_catalogs_guest_visible ON catalogs(guest_visible);
CREATE INDEX idx_catalogs_created_by ON catalogs(created_by);
CREATE INDEX idx_catalog_products_catalog ON catalog_products(catalog_id);

CREATE INDEX idx_images_original_filename ON images(original_filename);

CREATE INDEX idx_users_username ON users(username);

CREATE INDEX idx_products_search ON products
    USING GIN(to_tsvector('spanish', name || ' ' || description));
```

---

## 10. Diagrama de Estados: Catalogo

### Descripcion
Ciclo de vida de un catalogo desde creacion hasta habilitacion para empleados ruteros.

```mermaid
stateDiagram-v2
    [*] --> Borrador: Admin crea catalogo

    Borrador --> EnEdicion: Admin agrega productos
    EnEdicion --> EnEdicion: Admin modifica layout
    EnEdicion --> Borrador: Admin elimina todos los productos

    EnEdicion --> Generando: Admin solicita generar PDF

    Generando --> Completado: PDF generado exitosamente
    Generando --> Error: Fallo en generacion

    Error --> EnEdicion: Admin corrige y reintenta

    Completado --> HabilitadoGuest: Admin activa toggle guest_visible
    HabilitadoGuest --> Completado: Admin desactiva toggle guest_visible

    Completado --> EnEdicion: Admin edita catalogo
    HabilitadoGuest --> EnEdicion: Admin edita catalogo

    EnEdicion --> Archivado: Admin archiva
    Completado --> Archivado: Admin archiva
    HabilitadoGuest --> Archivado: Admin archiva

    Archivado --> [*]
```

### Estados

| Estado | Descripcion |
|--------|-------------|
| Borrador | Catalogo sin productos asignados |
| EnEdicion | Tiene productos pero sin PDF generado, o fue re-editado |
| Completado | PDF generado y almacenado, visible solo para Admin |
| HabilitadoGuest | Visible y descargable para todos los empleados ruteros autenticados |
| Archivado | Desactivado, no visible para nadie |

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

**Ultima actualizacion:** 20 de febrero de 2026
**Version:** 2.0
