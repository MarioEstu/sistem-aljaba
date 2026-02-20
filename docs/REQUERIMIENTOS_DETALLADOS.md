# Especificación Detallada de Requerimientos - Catalog Aljaba

## 1. REQUERIMIENTOS FUNCIONALES DETALLADOS

### 1.1 Módulo de Autenticación y Gestión de Usuarios

#### RF-AUTH-01: Registro de Usuarios Admin
**Descripción:** El sistema debe permitir el registro de usuarios administradores.

**Entradas:**
- Nombre completo
- Email (único en el sistema)
- Contraseña (mínimo 8 caracteres)
- Confirmación de contraseña

**Proceso:**
1. Validar formato de email
2. Verificar que el email no esté registrado
3. Validar fuerza de contraseña
4. Encriptar contraseña con bcrypt
5. Crear usuario con rol Admin
6. Enviar email de confirmación (opcional)

**Salidas:**
- Usuario creado exitosamente
- Token JWT de sesión

**Reglas de Negocio:**
- Solo puede haber usuarios Admin (Guest se crean por invitación)
- Email debe ser único
- Contraseña debe tener al menos: 8 caracteres, 1 mayúscula, 1 minúscula, 1 número

---

#### RF-AUTH-02: Inicio de Sesión
**Descripción:** Permitir a usuarios registrados acceder al sistema.

**Entradas:**
- Email
- Contraseña

**Proceso:**
1. Buscar usuario por email
2. Verificar contraseña encriptada
3. Generar token JWT con expiración de 24h
4. Incluir rol del usuario en el token

**Salidas:**
- Token de sesión
- Información del usuario (nombre, email, rol)

**Reglas de Negocio:**
- Máximo 5 intentos fallidos antes de bloqueo temporal (15 minutos)
- Token expira en 24 horas

---

#### RF-AUTH-03: Gestión de Roles
**Descripción:** El sistema debe diferenciar entre dos tipos de usuarios.

**Roles:**

| Rol | Permisos |
|-----|----------|
| **Admin** | - Acceso total al sistema<br>- Gestión de productos<br>- Edición de imágenes<br>- Creación de catálogos<br>- Generación de PDF<br>- Invitar usuarios Guest |
| **Guest** | - Visualizar catálogos compartidos<br>- Descargar PDF de catálogos permitidos<br>- Visualizar galería de imágenes compartidas |

---

### 1.2 Módulo de Gestión de Productos

#### RF-PROD-01: Importación de CSV
**Descripción:** Importar productos desde archivo CSV con estructura específica.

**Estructura CSV Obligatoria:**
```
Name,code,description,category,price1,price2,price3,price4,price5,price6,image,Stock Quality
```

**Campos del CSV:**

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| Name | String | Sí | Nombre del producto |
| code | String | Sí | Código único del producto |
| description | Text | Sí | Descripción del producto |
| category | String | Sí | Categoría del producto |
| price1 | Decimal | Sí | Precio cantidad 1 (ej: unidad) |
| price2 | Decimal | No | Precio cantidad 2 (ej: docena) |
| price3 | Decimal | No | Precio cantidad 3 |
| price4 | Decimal | No | Precio cantidad 4 |
| price5 | Decimal | No | Precio cantidad 5 |
| price6 | Decimal | No | Precio cantidad 6 |
| image | URL | Sí | URL o path de la imagen |
| Stock Quality | Integer | Sí | Cantidad en stock |

**Proceso de Importación:**
1. Validar formato del archivo (debe ser .csv)
2. Validar estructura (columnas coinciden)
3. Validar datos fila por fila:
   - Campos obligatorios presentes
   - Tipos de datos correctos
   - Códigos únicos
4. Mostrar reporte de validación (errores y advertencias)
5. Permitir corregir o continuar
6. Importar productos válidos
7. Asociar categorías automáticamente

**Salidas:**
- Reporte de importación (productos importados, errores, advertencias)
- Productos creados en base de datos

**Reglas de Negocio:**
- Si el código ya existe, preguntar si actualizar o omitir
- Categorías nuevas se crean automáticamente
- Imágenes externas se descargan y almacenan localmente

---

#### RF-PROD-02: Crear Producto Manualmente
**Descripción:** Permitir creación manual de productos desde interfaz web.

**Entradas:**
- Nombre del producto
- Código único
- Descripción
- Categoría (selección de árbol jerárquico)
- Hasta 6 precios con etiquetas personalizables
- Imagen (carga o selección de galería)
- Stock

**Validaciones:**
- Código único en el sistema
- Al menos 1 precio debe estar definido
- Imagen obligatoria

---

#### RF-PROD-03: Editar Producto
**Descripción:** Modificar información de productos existentes.

**Campos Editables:** Todos los campos excepto el ID interno

**Proceso:**
1. Cargar datos actuales del producto
2. Permitir modificación
3. Validar cambios
4. Guardar historial de cambios (auditoría)

---

#### RF-PROD-04: Eliminar Producto
**Descripción:** Eliminar productos del sistema.

**Proceso:**
1. Verificar si el producto está en catálogos existentes
2. Mostrar advertencia si está en uso
3. Ofrecer opciones:
   - Eliminación lógica (marcar como inactivo)
   - Eliminación física (borrar permanentemente)
4. Confirmar acción

---

#### RF-PROD-05: Búsqueda de Productos
**Descripción:** Sistema de búsqueda rápida y flexible.

**Criterios de Búsqueda:**
- Por nombre (búsqueda parcial, no sensible a mayúsculas)
- Por código (búsqueda exacta)
- Por categoría
- Por rango de precio
- Por disponibilidad de stock

**Características:**
- Búsqueda en tiempo real (mientras se escribe)
- Resultados paginados (50 productos por página)
- Ordenamiento por: nombre, código, precio, stock, fecha de creación

---

#### RF-PROD-06: Filtros Avanzados
**Descripción:** Filtrado múltiple de productos.

**Filtros Disponibles:**
- Categoría (selección múltiple jerárquica)
- Rango de precios (slider)
- Stock disponible (checkbox: en stock / agotado)
- Fecha de creación (rango de fechas)

**Características:**
- Filtros acumulativos (AND)
- Contador de resultados en tiempo real
- Guardar filtros como "vista rápida"

---

#### RF-PROD-07: Edición Masiva
**Descripción:** Modificar múltiples productos simultáneamente.

**Funcionalidades:**
1. **Selección múltiple:** Checkbox en lista de productos
2. **Acciones masivas disponibles:**
   - Cambiar categoría
   - Aplicar descuento porcentual a precios
   - Actualizar stock
   - Asignar/cambiar imagen
   - Eliminar productos seleccionados

**Proceso:**
1. Seleccionar productos (checkbox individual o seleccionar todos)
2. Elegir acción masiva
3. Configurar parámetros de la acción
4. Vista previa de cambios
5. Confirmar y aplicar
6. Mostrar reporte de cambios aplicados

**Reglas de Negocio:**
- Máximo 500 productos en edición masiva simultánea
- Operación reversible mediante historial

---

#### RF-PROD-08: Categorías y Subcategorías
**Descripción:** Sistema jerárquico de organización.

**Características:**
- Árbol de categorías ilimitado (niveles anidados)
- Drag & drop para reorganizar
- Renombrar categorías
- Mover productos entre categorías
- Eliminar categorías (reasignar productos)

**Ejemplo de Estructura:**
```
Iluminación
├── Iluminación Interior
│   ├── Bombillas LED
│   ├── Lámparas de Techo
│   └── Focos Empotrados
└── Iluminación Exterior
    ├── Reflectores
    └── Faroles
```

---

### 1.3 Módulo de Gestión de Imágenes

#### RF-IMG-01: Carga de Imágenes
**Descripción:** Subir imágenes al sistema.

**Formatos Soportados:** JPG, JPEG, PNG, WEBP

**Proceso:**
1. Validar formato y tamaño (máx 10MB)
2. Generar nombre único (UUID)
3. Optimizar imagen automáticamente:
   - Redimensionar si > 2000px en cualquier lado
   - Comprimir con calidad 85%
   - Generar thumbnail (300x300px)
4. Subir a almacenamiento en nube
5. Guardar metadata en base de datos

**Salidas:**
- URL pública de la imagen
- URL del thumbnail
- Metadata (tamaño, dimensiones, formato)

---

#### RF-IMG-02: Galería de Imágenes
**Descripción:** Visualizar todas las imágenes almacenadas.

**Características:**
- Grid responsive de thumbnails
- Búsqueda por nombre
- Filtro por fecha de carga
- Vista previa al hacer hover
- Selección múltiple
- Información de uso (en cuántos productos está)

---

#### RF-IMG-03: Editor de Imágenes Avanzado
**Descripción:** Editor visual con funcionalidades avanzadas.

**Funcionalidades Básicas:**
- Recortar (crop)
- Rotar (90°, 180°, 270°, libre)
- Voltear (horizontal/vertical)
- Redimensionar

**Funcionalidades Avanzadas:**
- **Ajustes de color:**
  - Brillo
  - Contraste
  - Saturación
  - Temperatura de color
  - Tinte
  
- **Efectos:**
  - Blur (desenfoque)
  - Sharpen (nitidez)
  - Filtros predefinidos (vintage, blanco/negro, sepia, etc.)
  
- **Capas:**
  - Agregar texto (fuente, tamaño, color, outline)
  - Agregar formas (rectángulos, círculos, líneas)
  - Stickers/iconos
  - Múltiples capas con orden z-index
  
- **Máscaras:**
  - Máscaras de recorte
  - Transparencia por áreas
  - Difuminado de bordes

**Características Técnicas:**
- Canvas HTML5 para renderizado
- Historial de cambios (undo/redo hasta 20 acciones)
- Exportar en PNG o JPG
- Guardar como nueva versión (no sobreescribir original)

---

### 1.4 Módulo de Diseño de Catálogos

#### RF-CAT-01: Crear Catálogo
**Descripción:** Crear nuevo catálogo vacío.

**Entradas:**
- Nombre del catálogo
- Descripción
- Formato de página (A4, Carta, Tabloide)
- Orientación (vertical/horizontal)
- Configuración de márgenes

**Salidas:**
- Catálogo creado con configuración base

---

#### RF-CAT-02: Seleccionar Productos para Catálogo
**Descripción:** Agregar productos al catálogo.

**Métodos de Selección:**
1. **Manual:** Buscar y seleccionar productos individualmente
2. **Por categoría:** Agregar todos los productos de una categoría
3. **Por filtros:** Aplicar filtros y agregar resultados
4. **Importar desde CSV:** Importar lista de códigos de productos

**Características:**
- Orden customizable (drag & drop)
- Paginación automática o manual
- Vista previa de productos seleccionados

---

#### RF-CAT-03: Editor Visual de Layout
**Descripción:** Diseñar la apariencia del catálogo.

**Layouts Predefinidos:**

1. **Grid Layout:**
   - Configurable: 2, 3, 4 o 6 productos por página
   - Cada producto muestra: imagen, nombre, código, precios, descripción corta

2. **Lista Layout:**
   - 1 producto por fila
   - Vista horizontal: imagen izquierda, información derecha

3. **Ficha Detallada:**
   - 1 producto por página
   - Imagen grande
   - Toda la información del producto

**Elementos Personalizables:**
- **Portada:**
  - Logo de la empresa
  - Título del catálogo
  - Imagen de fondo
  
- **Encabezados y pies de página:**
  - Texto personalizado
  - Número de página
  - Fecha de generación
  
- **Estilos:**
  - Fuentes (tamaño, color, familia)
  - Colores de fondo y bordes
  - Espaciado entre productos
  
- **Información visible por producto:**
  - Checkboxes para mostrar/ocultar: código, descripción, precios individuales, stock

**Editor Visual:**
- Drag & drop de elementos
- Vista previa en tiempo real
- Plantillas guardables
- Aplicar plantilla a todo el catálogo

---

#### RF-CAT-04: Vista Previa del Catálogo
**Descripción:** Visualizar cómo se verá el PDF antes de generar.

**Características:**
- Paginación interactiva
- Zoom in/out
- Vista de miniaturas de páginas
- Modo pantalla completa

---

### 1.5 Módulo de Exportación PDF

#### RF-PDF-01: Generar PDF
**Descripción:** Crear archivo PDF del catálogo diseñado.

**Proceso:**
1. Renderizar cada página del catálogo
2. Aplicar estilos y configuraciones
3. Incrustar imágenes de alta calidad
4. Generar tabla de contenidos (opcional)
5. Compilar PDF
6. Comprimir para web (si se solicita)

**Configuraciones de Exportación:**
- Calidad de imágenes (alta/media/baja)
- Incluir marcas de agua
- Protección con contraseña (opcional)
- Tamaño de archivo (optimizado/original)

**Salidas:**
- Archivo PDF descargable
- Metadata del PDF (tamaño, páginas, fecha)

**Reglas de Negocio:**
- Tiempo máximo de generación: 30 segundos para catálogos de hasta 100 productos
- PDF generado se almacena temporalmente (24 horas) para re-descarga

---

### 1.6 Módulo de Compartir (Guest Access)

#### RF-GUEST-01: Generar Enlace de Acceso
**Descripción:** Crear enlace público para compartir catálogo.

**Entradas:**
- Catálogo a compartir
- Permisos:
  - Solo visualización
  - Visualización + descarga PDF
  - Visualización + descarga de imágenes individuales
- Fecha de expiración (opcional)
- Contraseña (opcional)

**Salidas:**
- URL única e irrepetible (token UUID)
- QR code del enlace (opcional)

**Reglas de Negocio:**
- Enlace expira después de la fecha configurada
- Pueden existir múltiples enlaces para el mismo catálogo
- Admin puede revocar enlaces en cualquier momento

---

#### RF-GUEST-02: Vista de Guest
**Descripción:** Interfaz simplificada para usuarios invitados.

**Características:**
- Sin necesidad de registro
- Ingreso directo mediante URL compartida
- Vista de catálogo con scroll infinito
- Botón de descarga PDF (si tiene permiso)
- Marca de agua o logo de Aljaba en vistas Guest

---

## 2. REQUERIMIENTOS NO FUNCIONALES DETALLADOS

### 2.1 Rendimiento

| ID | Métrica | Objetivo | Crítico |
|----|---------|----------|---------|
| RNF-PERF-01 | Carga inicial de página | < 3 seg | Sí |
| RNF-PERF-02 | Búsqueda de productos | < 1 seg | Sí |
| RNF-PERF-03 | Carga de galería (50 imgs) | < 2 seg | No |
| RNF-PERF-04 | Generación PDF (100 productos) | < 10 seg | Sí |
| RNF-PERF-05 | Importación CSV (1000 productos) | < 30 seg | Sí |
| RNF-PERF-06 | Guardado de cambios en editor | < 500 ms | No |

---

### 2.2 Escalabilidad

**Capacidad del Sistema:**
- **Productos:** hasta 10,000 productos
- **Imágenes:** hasta 50,000 imágenes (50GB)
- **Usuarios Admin:** hasta 10 usuarios
- **Usuarios Guest simultáneos:** hasta 100
- **Catálogos:** ilimitados
- **Productos por catálogo:** hasta 1,000

**Estrategias de Escalabilidad:**
- Lazy loading de imágenes
- Paginación de resultados
- Cache de catálogos generados
- CDN para imágenes estáticas

---

### 2.3 Seguridad

#### Autenticación y Autorización
- JWT con expiración de 24h
- Refresh tokens para sesiones largas
- Rate limiting: 100 requests/minuto por IP

#### Protección de Datos
- HTTPS obligatorio en producción
- Contraseñas hasheadas con bcrypt (cost factor 12)
- Validación y sanitización de inputs
- Protección contra SQL injection (uso de ORM)
- Protección contra XSS (sanitización HTML)

#### Almacenamiento
- Imágenes almacenadas en bucket privado de S3
- URLs firmadas con expiración temporal
- Backup automático diario de base de datos

---

### 2.4 Usabilidad

**Principios de Diseño:**
- Material Design o diseño moderno similar
- Interfaz intuitiva sin capacitación previa
- Feedback visual inmediato de acciones
- Mensajes de error claros y accionables
- Tooltips y ayuda contextual

**Responsive Design:**
- Desktop (> 1024px): interfaz completa
- Tablet (768px - 1024px): interfaz adaptada
- Mobile (< 768px): funcionalidades esenciales

**Accesibilidad:**
- Contraste de colores adecuado (WCAG AA)
- Navegación por teclado
- Textos alternativos en imágenes

---

### 2.5 Mantenibilidad

**Código:**
- Arquitectura modular
- Código comentado en secciones complejas
- Nombres de variables descriptivos
- Separación de responsabilidades (MVC o similar)

**Documentación:**
- README con instrucciones de instalación
- Documentación de API (Swagger/OpenAPI)
- Comentarios en código complejo
- Guía de contribución

**Testing:**
- Tests unitarios para lógica de negocio crítica
- Tests de integración para APIs
- Cobertura mínima: 60%

---

### 2.6 Compatibilidad

**Navegadores:**
- Chrome (últimas 2 versiones)
- Firefox (últimas 2 versiones)
- Edge (últimas 2 versiones)
- Safari (últimas 2 versiones)

**Dispositivos:**
- Desktop (Windows, macOS, Linux)
- Tablet (iOS, Android)
- Mobile (iOS, Android)

---

## 3. HISTORIAS DE USUARIO

### Historia 1: Importación de Catálogo CSV
**Como** administrador de Aljaba  
**Quiero** importar un archivo CSV con todos mis productos  
**Para** cargar masivamente el inventario sin entrada manual  

**Criterios de Aceptación:**
- Puedo subir archivo CSV desde interfaz web
- Sistema valida estructura antes de importar
- Veo reporte de errores si hay datos inválidos
- Puedo corregir y reintentar
- Productos válidos se importan correctamente

---

### Historia 2: Editar Imagen de Producto
**Como** administrador de Aljaba  
**Quiero** editar imágenes directamente en el sistema  
**Para** mejorar la calidad visual sin usar Canva  

**Criterios de Aceptación:**
- Puedo abrir editor desde el detalle del producto
- Puedo aplicar filtros y efectos
- Puedo agregar texto sobre la imagen
- Cambios se guardan como nueva versión
- Imagen editada se actualiza en producto

---

### Historia 3: Crear Catálogo Visual
**Como** administrador de Aljaba  
**Quiero** diseñar un catálogo con layout personalizado  
**Para** generar PDFs profesionales para mis clientes  

**Criterios de Aceptación:**
- Puedo seleccionar productos para incluir
- Puedo elegir layout (grid, lista, fichas)
- Puedo personalizar colores y fuentes
- Veo vista previa en tiempo real
- Puedo generar y descargar PDF

---

### Historia 4: Compartir Catálogo con Cliente
**Como** administrador de Aljaba  
**Quiero** generar un enlace de mi catálogo  
**Para** que mis clientes lo vean sin necesidad de cuenta  

**Criterios de Aceptación:**
- Puedo generar enlace único por catálogo
- Puedo configurar permisos (solo ver o descargar)
- Puedo configurar fecha de expiración
- Cliente accede sin registro
- Puedo revocar enlace en cualquier momento

---

### Historia 5: Visualizar Catálogo como Guest
**Como** cliente de Aljaba (Guest)  
**Quiero** ver el catálogo compartido conmigo  
**Para** conocer los productos disponibles y sus precios  

**Criterios de Aceptación:**
- Accedo mediante enlace sin registro
- Veo productos con imágenes y precios
- Puedo descargar PDF si tengo permiso
- Interfaz es clara y profesional
- Funciona en mi móvil

---

## 4. CASOS DE USO PRINCIPALES

### CU-01: Gestionar Productos (Admin)
**Actor:** Administrador  
**Precondición:** Usuario autenticado como Admin  
**Flujo Principal:**
1. Admin accede al módulo de productos
2. Admin puede:
   - Ver lista de productos
   - Buscar/filtrar productos
   - Crear nuevo producto
   - Editar producto existente
   - Eliminar producto
   - Importar desde CSV
   - Editar masivamente

---

### CU-02: Diseñar y Generar Catálogo (Admin)
**Actor:** Administrador  
**Precondición:** Existen productos en el sistema  
**Flujo Principal:**
1. Admin crea nuevo catálogo
2. Admin selecciona productos a incluir
3. Admin elige layout y personaliza diseño
4. Admin genera PDF del catálogo
5. Admin descarga o comparte el catálogo

---

### CU-03: Visualizar Catálogo Compartido (Guest)
**Actor:** Cliente (Guest)  
**Precondición:** Admin ha generado enlace compartido  
**Flujo Principal:**
1. Guest accede mediante URL compartida
2. Sistema valida enlace (no expirado, activo)
3. Guest visualiza catálogo
4. Guest descarga PDF si tiene permiso

---

**Última actualización:** 14 de febrero de 2026  
**Versión:** 1.0
