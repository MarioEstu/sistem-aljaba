# Especificación Detallada de Requerimientos - Catalog Aljaba

## 1. REQUERIMIENTOS FUNCIONALES DETALLADOS

### 1.1 Módulo de Autenticación y Gestión de Usuarios

#### RF-AUTH-01: Creación de Usuarios (Admin y Guest)
**Descripción:** El sistema debe permitir al Administrador crear cuentas de usuario para ambos roles.

**Creación de usuario Admin:**

Entradas:
- Nombre completo
- Nombre de usuario o email (único en el sistema)
- Contraseña (mínimo 8 caracteres)
- Confirmación de contraseña

**Creación de usuario Guest (realizada por Admin):**

Entradas:
- Nombre completo del empleado
- Nombre de usuario (único en el sistema)
- Contraseña inicial
- Rol: Guest

**Proceso:**
1. Validar que el nombre de usuario no esté registrado
2. Validar fuerza de contraseña
3. Encriptar contraseña con bcrypt
4. Crear usuario con el rol correspondiente

**Salidas:**
- Usuario creado exitosamente

**Reglas de Negocio:**
- El Admin crea las cuentas Guest para los empleados ruteros
- No existe auto-registro; solo el Admin puede crear cuentas
- Nombre de usuario debe ser único
- Contraseña debe tener al menos: 8 caracteres, 1 mayúscula, 1 minúscula, 1 número
- El Admin puede desactivar cuentas Guest en cualquier momento

---

#### RF-AUTH-02: Inicio de Sesión
**Descripción:** Permitir a usuarios registrados acceder al sistema.

**Entradas:**
- Nombre de usuario
- Contraseña

**Proceso:**
1. Buscar usuario por nombre de usuario
2. Verificar contraseña encriptada
3. Generar token JWT con expiración de 24h
4. Incluir rol del usuario en el token

**Salidas:**
- Token de sesión
- Información del usuario (nombre, nombre de usuario, rol)

**Reglas de Negocio:**
- Máximo 5 intentos fallidos antes de bloqueo temporal (15 minutos)
- Token expira en 24 horas

---

#### RF-AUTH-03: Gestión de Roles
**Descripción:** El sistema debe diferenciar entre dos tipos de usuarios.

**Definición de usuarios Guest:**
Los usuarios Guest son los empleados ruteros de Aljaba S.A. Su función es mostrar o enviar los catálogos de la empresa a los clientes. Cuentan con usuario y contraseña propios, acceso permanente al sistema sin fechas de expiración, y pueden ver y descargar únicamente los catálogos que el Admin haya habilitado para visualización.

**Roles:**

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **Admin** | Personal de oficina de Aljaba | - Acceso total al sistema<br>- Gestión de productos<br>- Carga y edición de imágenes<br>- Creación de catálogos<br>- Generación de PDF<br>- Habilitar/deshabilitar visibilidad de catálogos para Guests<br>- Crear y gestionar cuentas Guest<br>- Gestión de categorías y categorías padre |
| **Guest** | Empleados ruteros de Aljaba | - Iniciar sesión con usuario y contraseña<br>- Visualizar catálogos habilitados por el Admin<br>- Descargar PDF de catálogos habilitados<br>- Sin acceso a gestión de productos ni imágenes |

**Reglas de Negocio:**
- El Admin no envía enlaces individuales a los Guests; en su lugar habilita o deshabilita la visibilidad de un catálogo para todos los Guests
- Una vez habilitado, todos los Guests pueden ver y descargar ese catálogo
- Los Guests no tienen límite de tiempo para acceder al sistema
- El Admin puede crear, editar y desactivar cuentas Guest desde el panel de administración

---

### 1.2 Módulo de Gestión de Productos

#### RF-PROD-01: Importación de CSV
**Descripción:** Importar productos desde archivo CSV con estructura específica.

**Estructura CSV Obligatoria:**
```
Name,code,description,category,price1,price2,price3,price4,price5,price6,Stock Quality
```

**Nota importante:** La columna `image` ha sido eliminada del CSV. La vinculación de imágenes a productos se realiza automáticamente por coincidencia de nombre de archivo con el campo `Name` del producto. Ver RF-IMG-04 para el detalle de este proceso.

**Campos del CSV:**

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| Name | String | Sí | Nombre del producto (debe coincidir con el nombre del archivo de imagen ya subido) |
| code | String | Sí | Código único del producto |
| description | Text | Sí | Descripción del producto |
| category | String | Sí | Categoría del producto |
| price1 | Decimal | Sí | Precio cantidad 1 (ej: unidad) |
| price2 | Decimal | No | Precio cantidad 2 (ej: docena) |
| price3 | Decimal | No | Precio cantidad 3 |
| price4 | Decimal | No | Precio cantidad 4 |
| price5 | Decimal | No | Precio cantidad 5 |
| price6 | Decimal | No | Precio cantidad 6 |
| Stock Quality | Integer | Sí | Cantidad en stock |

**Proceso de Importación:**
1. Validar formato del archivo (debe ser .csv)
2. Validar estructura (columnas coinciden, 11 columnas)
3. Validar datos fila por fila:
   - Campos obligatorios presentes
   - Tipos de datos correctos
   - Códigos únicos
4. Para cada producto, buscar en la galería de imágenes del sistema una imagen cuyo nombre (sin extensión, insensible a mayúsculas/minúsculas) coincida con el campo `Name`
5. Mostrar reporte de validación (errores, advertencias e imágenes no encontradas)
6. Permitir corregir o continuar
7. Importar productos válidos
8. Asociar categorías automáticamente

**Salidas:**
- Reporte de importación (productos importados, errores, advertencias, imágenes no vinculadas)
- Productos creados en base de datos

**Reglas de Negocio:**
- Las imágenes deben estar subidas al sistema ANTES de importar el CSV
- Si no se encuentra imagen con el mismo `Name`, el producto se importa con imagen en blanco y se muestra advertencia
- Si el código ya existe, preguntar si actualizar o omitir
- Categorías nuevas se crean automáticamente

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

#### RF-PROD-08: Categorías, Subcategorías y Categorías Padre
**Descripción:** Sistema de organización jerárquica de dos niveles: categorías padre que agrupan categorías, y categorías que agrupan productos.

**Nivel 1: Categorías Padre**
Las categorías padre son agrupaciones libres que el Admin puede crear para reunir múltiples categorías bajo un nombre común. Son de total disposición del administrador en cuanto a nombre y composición.

**Características de Categorías Padre:**
- El Admin crea categorías padre con el nombre que decida
- El Admin elige qué categorías incluir en cada categoría padre
- Una categoría puede pertenecer a una sola categoría padre a la vez
- El Admin puede en cualquier momento:
  - Renombrar una categoría padre
  - Agregar categorías a una categoría padre
  - Quitar categorías de una categoría padre
  - Eliminar una categoría padre (las categorías que contenía quedan sin categoría padre)

**Nivel 2: Categorías de Productos**
Son las categorías directas de los productos (las que llegan del CSV o se crean manualmente). Pueden estar agrupadas bajo una categoría padre o existir independientemente.

**Características de Categorías de Productos:**
- Árbol jerárquico (categorías y subcategorías)
- Drag & drop para reorganizar
- Renombrar categorías
- Mover productos entre categorías
- Eliminar categorías (reasignar productos)

**Ejemplo de Estructura:**
```
[Categoria Padre] LP - Lamparas y Plomeria
  ├── Iluminacion        (categoria)
  │   ├── Bombillas LED  (subcategoria)
  │   └── Reflectores    (subcategoria)
  └── Plomeria           (categoria)
      ├── Tuberias       (subcategoria)
      └── Llaves         (subcategoria)

[Categoria Padre] FA - Ferreteria y Automotriz
  ├── Ferreteria         (categoria)
  └── Automotriz         (categoria)

[Sin categoria padre]
  └── Papeleria          (categoria)
```

**Uso en catálogos:**
El Admin puede seleccionar productos para un catálogo filtrando por categoría padre, por categoría, o por subcategoría.

**Reglas de Negocio:**
- Los nombres de categorías padre son libres y definidos por el Admin
- Una categoría puede estar sin categoría padre asignada
- Eliminar una categoría padre no elimina las categorías que agrupaba

---

### 1.3 Módulo de Gestión de Imágenes

#### RF-IMG-01: Carga de Imágenes
**Descripción:** Subir imágenes al sistema antes de importar el CSV.

**Formatos Soportados:** JPG, JPEG, PNG, WEBP

**Convención de Nombres Obligatoria:**
El nombre del archivo de imagen debe corresponder al valor del campo `Name` del producto en el CSV. Esta es la clave de vinculación automática.

- Ejemplo: si el producto tiene `Name = 001lampara`, el archivo de imagen puede llamarse `001lampara.jpg`, `001Lampara.jpg` o `001LAMPARA.PNG`; todos son válidos.
- La comparación de nombres es **insensible a mayúsculas/minúsculas (case-insensitive)**: `001Lampara` y `001lampara` se consideran el mismo nombre.
- La extensión del archivo es ignorada para la comparación; solo importa el nombre sin extensión.

**Proceso:**
1. Validar formato y tamaño (max 10MB)
2. Conservar el nombre original del archivo (sin generar UUID, ya que el nombre es clave de vinculacion)
3. Optimizar imagen automáticamente:
   - Redimensionar si > 2000px en cualquier lado
   - Comprimir con calidad 85%
   - Generar thumbnail (300x300px)
4. Subir a almacenamiento en nube
5. Guardar metadata en base de datos incluyendo el nombre original del archivo

**Salidas:**
- URL de la imagen almacenada
- URL del thumbnail
- Metadata (nombre original, tamaño, dimensiones, formato)

---

#### RF-IMG-02: Galería de Imágenes
**Descripción:** Visualizar todas las imágenes almacenadas.

**Características:**
- Grid responsive de thumbnails
- Búsqueda por nombre de archivo
- Filtro por fecha de carga
- Vista previa al hacer hover
- Selección múltiple
- Información de uso (vinculada a producto / sin vincular)
- Indicador visual de imágenes que aún no tienen producto asociado

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
- **Al guardar, la imagen editada sobreescribe la imagen original en el almacenamiento.** El nombre del archivo se mantiene igual para conservar la vinculación automática con el producto. La versión original es descartada y no se conserva copia.

---

#### RF-IMG-04: Vinculación Automática de Imágenes a Productos
**Descripción:** El sistema vincula automáticamente imágenes a productos comparando el nombre del archivo de imagen con el campo `Name` del producto.

**Proceso de Vinculación (ocurre al importar CSV):**
1. Para cada fila del CSV, el sistema toma el valor del campo `Name`
2. Busca en la galería de imágenes del sistema un archivo cuyo nombre (sin extensión) coincida exactamente con ese `Name`
3. Si encuentra coincidencia, vincula la imagen al producto
4. Si no encuentra coincidencia, importa el producto sin imagen y registra la advertencia

**Proceso de Re-vinculación (operación manual):**
- El Admin puede desde la vista de un producto sin imagen, buscar y asignar manualmente una imagen de la galería
- También puede subir una nueva imagen directamente desde el formulario del producto

**Reglas de Negocio:**
- La comparación de nombres es **insensible a mayúsculas/minúsculas (case-insensitive)**: el sistema convierte ambos nombres a minúsculas antes de comparar
- Solo se acepta un archivo de imagen por nombre (si hay duplicados, el sistema alerta al Admin)
- Las imágenes deben cargarse al sistema antes de importar el CSV para garantizar la vinculación automática
- Si se sube una imagen con el mismo nombre que un producto existente sin imagen, el sistema la vincula automáticamente

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
**Descripción:** Crear archivo PDF del catálogo diseñado de forma asíncrona mediante una cola de procesamiento. La generación nunca bloquea la interfaz ni el servidor; el usuario es notificado cuando el PDF está listo.

**Proceso (basado en cola de trabajos):**
1. Admin solicita generación del PDF desde la interfaz
2. El sistema registra un trabajo en la cola (`pdf_jobs`) con estado `pending`
3. El backend responde inmediatamente con el ID del trabajo; la interfaz muestra estado "Generando..."
4. El worker del servidor toma el trabajo de la cola y lo procesa:
   a. Renderizar cada página del catálogo con Puppeteer
   b. Aplicar estilos y configuraciones
   c. Incrustar imágenes de alta calidad
   d. Generar tabla de contenidos (si se solicitó)
   e. Compilar y comprimir el PDF
   f. Subir el PDF generado al almacenamiento en nube (S3/Spaces)
   g. Guardar la URL del PDF en el campo `pdf_url` del catálogo
5. El estado del trabajo cambia a `completed`; la interfaz muestra el botón de descarga
6. Si ocurre un error, el estado cambia a `failed` y se muestra mensaje al Admin

**Estados del trabajo en cola:**

| Estado | Descripción |
|--------|-------------|
| `pending` | Trabajo encolado, esperando al worker |
| `processing` | Worker procesando activamente |
| `completed` | PDF generado y disponible para descarga |
| `failed` | Error durante la generación; puede reintentarse |

**Configuraciones de Exportación:**
- Calidad de imágenes (alta/media/baja)
- Incluir marcas de agua
- Tamaño de archivo (optimizado/original)

**Salidas:**
- URL del PDF almacenado en nube
- Metadata del PDF (tamaño, páginas, fecha de generación)

**Reglas de Negocio:**
- La generación es siempre asíncrona; nunca sincrónica
- El worker procesa de a un trabajo a la vez para evitar sobrecarga de memoria del servidor
- Si el catálogo ya tiene un `pdf_url` previo, la nueva generación lo sobreescribe
- El PDF generado se almacena permanentemente (no tiene expiración) y puede descargarse las veces que sea necesario
- En caso de fallo, el Admin puede reintentar la generación desde la interfaz

---

### 1.6 Módulo de Acceso Guest (Empleados Ruteros)

#### RF-GUEST-01: Habilitación de Catálogos para Guests
**Descripción:** El Admin controla qué catálogos son visibles para todos los usuarios Guest del sistema.

**Proceso:**
1. Admin accede a la lista de catálogos
2. Admin activa o desactiva el acceso Guest por catálogo mediante un toggle o switch
3. Al activar, el catálogo queda visible para todos los usuarios Guest autenticados
4. Al desactivar, el catálogo deja de aparecer en la vista Guest inmediatamente

**Entradas:**
- Catálogo a habilitar/deshabilitar
- Estado deseado: habilitado / deshabilitado

**Salidas:**
- Estado del catálogo actualizado
- Catálogo visible u oculto en la vista Guest

**Reglas de Negocio:**
- No se generan enlaces individuales; el acceso es para todos los Guests autenticados
- No hay fechas de expiración; el acceso se mantiene mientras el Admin no lo deshabilite
- El Admin puede habilitar múltiples catálogos simultáneamente
- La acción es instantánea; no requiere regenerar el catálogo ni el PDF

---

#### RF-GUEST-02: Gestión de Cuentas Guest
**Descripción:** El Admin crea y administra las cuentas de los empleados ruteros (Guests).

**Funcionalidades:**
- Crear cuenta Guest: nombre, nombre de usuario, contraseña inicial
- Ver lista de todos los Guests registrados
- Editar nombre o nombre de usuario de un Guest
- Restablecer contraseña de un Guest
- Activar o desactivar cuenta de un Guest

**Reglas de Negocio:**
- Solo el Admin puede crear, editar o desactivar cuentas Guest
- Un Guest desactivado no puede iniciar sesión
- No existe auto-registro para Guests

---

#### RF-GUEST-03: Vista del Empleado Rutero (Guest)
**Descripción:** Interfaz del sistema para el usuario Guest.

**Flujo de Acceso:**
1. Guest ingresa al sistema con su nombre de usuario y contraseña
2. El sistema autentica y redirige al panel Guest
3. Guest ve únicamente los catálogos que el Admin ha habilitado

**Características de la Vista Guest:**
- Lista de catálogos habilitados con nombre, descripción e imagen de portada
- Botón de descarga de PDF para cada catálogo habilitado
- Interfaz limpia y simple, orientada a uso rápido en campo
- Responsive: funciona correctamente en móvil y tablet
- Sin acceso a módulos de administración (productos, imágenes, categorías, configuración)

---

## 2. REQUERIMIENTOS NO FUNCIONALES DETALLADOS

### 2.1 Rendimiento

| ID | Métrica | Objetivo | Crítico |
|----|---------|----------|---------|
| RNF-PERF-01 | Carga inicial de página | < 3 seg | Sí |
| RNF-PERF-02 | Búsqueda de productos | < 1 seg | Sí |
| RNF-PERF-03 | Carga de galería (50 imgs) | < 2 seg | No |
| RNF-PERF-04 | Generación PDF (100 productos) | < 60 seg (asíncrono, en cola) | Sí |
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
- Al guardar, la imagen editada sobreescribe la original con el mismo nombre
- La vinculación con el producto se mantiene sin necesidad de cambiar nada más

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

### Historia 4: Habilitar Catálogo para Empleados Ruteros
**Como** administrador de Aljaba  
**Quiero** habilitar un catálogo para que mis empleados ruteros lo vean  
**Para** que puedan mostrarlo o enviarlo a los clientes sin que yo deba hacer nada mas  

**Criterios de Aceptación:**
- Puedo activar o desactivar un catálogo para Guests con un toggle
- Al activar, todos los Guests autenticados ven el catálogo inmediatamente
- Al desactivar, el catálogo desaparece de la vista Guest inmediatamente
- No necesito generar ni enviar enlaces

---

### Historia 5: Acceder al Sistema como Empleado Rutero (Guest)
**Como** empleado rutero de Aljaba (Guest)  
**Quiero** iniciar sesión en el sistema con mi usuario y contraseña  
**Para** poder ver y descargar los catálogos en mi dispositivo y mostrárselos a los clientes  

**Criterios de Aceptación:**
- Inicio sesión con usuario y contraseña asignados por el Admin
- Solo veo los catálogos que el Admin ha habilitado para Guests
- Puedo descargar el PDF de cada catálogo habilitado
- La interfaz funciona bien en mi celular o tablet
- Mi acceso no tiene fecha de expiración

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

### CU-03: Acceder a Catálogos como Empleado Rutero (Guest)
**Actor:** Empleado Rutero (Guest)  
**Precondición:** Admin ha creado la cuenta Guest y ha habilitado al menos un catálogo  
**Flujo Principal:**
1. Guest ingresa al sistema con usuario y contraseña
2. Sistema autentica y redirige al panel Guest
3. Guest ve la lista de catálogos habilitados por el Admin
4. Guest selecciona un catálogo para visualizarlo
5. Guest descarga el PDF del catálogo

---

**Última actualización:** 20 de febrero de 2026  
**Versión:** 1.0
