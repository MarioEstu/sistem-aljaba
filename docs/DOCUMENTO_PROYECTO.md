# Proyecto de Graduación: Sistema de Gestión y Generación de Catálogos Digitales para Aljaba S.A.

## Información General del Proyecto

**Nombre del Proyecto:** Catalog Aljaba  
**Empresa Cliente:** Aljaba S.A. - Guatemala  
**Tipo:** Sistema Web de Gestión de Catálogos Digitales  
**Estudiante:** [Tu Nombre]  
**Carrera:** Ingeniería en Sistemas  
**Fecha de Inicio:** Febrero 2026  
**Tiempo de Desarrollo:** 5 meses  
**Fecha Estimada de Entrega:** Julio 2026

---

## 1. CONTEXTO Y PROBLEMÁTICA

### 1.1 Situación Actual de Aljaba S.A.

Aljaba S.A. es una empresa guatemalteca dedicada a la comercialización de productos. Actualmente gestiona aproximadamente **4,000 productos** y proyecta crecer hasta **10,000 productos** para finales de 2026.

### 1.2 Flujo de Trabajo Actual (Problemático)

El proceso actual involucra **6 pasos** y **3 plataformas externas**:

1. **Recepción de catálogos de proveedores** (Excel de baja calidad)
2. **Edición de imágenes** → Canva (https://www.canva.com)
3. **Almacenamiento de imágenes** → Postimages (https://postimages.org/es/)
4. **Gestión de productos** → Excel/CSV mejorado
5. **Exportación a CSV** con estructura específica
6. **Generación de catálogos PDF** → Catalog Machine (https://www.catalogmachine.com/)

### 1.3 Problemas Identificados

| Problema | Impacto |
|----------|---------|
| **Dependencia de múltiples plataformas** | Riesgo operativo alto |
| **Costo mensual elevado** | $120/mes solo en Catalog Machine |
| **Flujo de trabajo fragmentado** | Pérdida de tiempo y eficiencia |
| **Falta de control sobre datos** | Riesgo de pérdida de información |
| **Proceso manual repetitivo** | Alto esfuerzo para 4,000+ productos |

---

## 2. OBJETIVOS DEL PROYECTO

### 2.1 Objetivo General

Desarrollar un sistema web integral que unifique las funcionalidades de **Catalog Machine**, **Canva** y **Postimages** en una única plataforma propietaria, reduciendo costos operativos y mejorando la eficiencia del flujo de trabajo de Aljaba S.A.

### 2.2 Objetivos Específicos

1. **Gestión de Productos:**
   - Importación y validación de archivos CSV con estructura específica
   - CRUD completo de productos con categorías/subcategorías
   - Sistema de búsqueda y filtros avanzados

2. **Almacenamiento de Imágenes:**
   - Sistema de almacenamiento propio en la nube
   - Gestión de hasta 10,000+ imágenes
   - Optimización automática de imágenes

3. **Editor Visual Avanzado:**
   - Editor de imágenes con capas, efectos y máscaras
   - Plantillas personalizables para catálogos
   - Edición masiva de productos

4. **Generación de Catálogos PDF:**
   - Múltiples layouts (grid, lista, fichas)
   - Exportación PDF de alta calidad
   - Personalización de diseño

5. **Sistema de Autenticación y Roles:**
   - **Admin:** acceso total al sistema
   - **Guest:** visualización y descarga de catálogos compartidos

---

## 3. ALCANCE DEL PROYECTO

### 3.1 Funcionalidades Incluidas (Dentro del Alcance)

#### Módulo de Autenticación
-  Registro e inicio de sesión
-  Gestión de roles (Admin/Guest)
-  Recuperación de contraseña

#### Módulo de Gestión de Productos
-  Importación de CSV (validación de estructura)
-  CRUD de productos (crear, leer, actualizar, eliminar)
-  Organización por categorías y subcategorías jerárquicas
-  Sistema de búsqueda avanzada
-  Filtros por categoría, precio, stock
-  Edición masiva de productos

#### Módulo de Gestión de Imágenes
-  Carga de imágenes (múltiples formatos)
-  Almacenamiento en nube
-  Optimización automática
-  Galería de imágenes
-  Asignación de imágenes a productos

#### Módulo de Editor Visual
-  Editor de imágenes avanzado (capas, efectos, máscaras)
-  Herramientas de recorte, rotación, ajuste de color
-  Texto sobre imagen
-  Filtros y efectos
-  Guardado de versiones editadas

#### Módulo de Diseño de Catálogos
-  Creación de catálogos con productos seleccionados
-  Editor visual de layout
-  Plantillas personalizables
-  Vista previa en tiempo real
-  Múltiples formatos de visualización (grid, lista, fichas)

#### Módulo de Exportación PDF
-  Generación de PDF de alta calidad
-  Múltiples layouts
-  Configuración de márgenes, tamaños, orientación
-  Descarga directa

#### Módulo de Compartir (Guest Access)
-  Generación de enlaces de acceso
-  Control de permisos por catálogo
-  Visualización de catálogos compartidos
-  Descarga de PDF para guests

### 3.2 Funcionalidades Excluidas (Fuera del Alcance - Fase 1)

-  Sistema de facturación o ventas
-  Integración con sistemas ERP
-  Aplicación móvil nativa
-  Múltiples idiomas (solo español)
-  Sistema de versionado de catálogos
-  Colaboración en tiempo real entre usuarios
-  Analytics avanzado

---

## 4. REQUERIMIENTOS DEL SISTEMA

### 4.1 Requerimientos Funcionales

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RF-01 | El sistema debe importar archivos CSV con la estructura: Name, code, description, category, price1-6, image, Stock Quality | **Alta** |
| RF-02 | El sistema debe validar la estructura del CSV antes de importar | **Alta** |
| RF-03 | El sistema debe permitir crear, editar y eliminar productos | **Alta** |
| RF-04 | El sistema debe organizar productos por categorías y subcategorías | **Alta** |
| RF-05 | El sistema debe permitir búsqueda por nombre, código, categoría | **Media** |
| RF-06 | El sistema debe soportar filtros por rango de precio y stock | **Media** |
| RF-07 | El sistema debe permitir edición masiva de productos | **Alta** |
| RF-08 | El sistema debe almacenar imágenes en la nube | **Alta** |
| RF-09 | El sistema debe optimizar imágenes automáticamente | **Media** |
| RF-10 | El sistema debe incluir un editor de imágenes con capas | **Alta** |
| RF-11 | El sistema debe permitir aplicar efectos y máscaras a imágenes | **Media** |
| RF-12 | El sistema debe permitir diseñar catálogos con editor visual | **Alta** |
| RF-13 | El sistema debe soportar múltiples layouts de catálogo | **Alta** |
| RF-14 | El sistema debe generar PDF de alta calidad | **Alta** |
| RF-15 | El sistema debe permitir compartir catálogos con usuarios Guest | **Media** |
| RF-16 | El sistema debe tener autenticación con roles Admin/Guest | **Alta** |

### 4.2 Requerimientos No Funcionales

| ID | Categoría | Requerimiento | Especificación |
|----|-----------|---------------|----------------|
| RNF-01 | **Rendimiento** | Tiempo de carga de página | < 3 segundos |
| RNF-02 | **Rendimiento** | Generación de PDF (100 productos) | < 10 segundos |
| RNF-03 | **Rendimiento** | Carga de galería de imágenes | < 2 segundos |
| RNF-04 | **Escalabilidad** | Soporte de productos | Hasta 10,000 productos |
| RNF-05 | **Escalabilidad** | Almacenamiento de imágenes | Hasta 50GB |
| RNF-06 | **Disponibilidad** | Uptime del sistema | 99% |
| RNF-07 | **Seguridad** | Comunicación | HTTPS obligatorio |
| RNF-08 | **Seguridad** | Autenticación | JWT con expiración |
| RNF-09 | **Seguridad** | Contraseñas | Encriptación bcrypt |
| RNF-10 | **Usabilidad** | Responsive design | Desktop, tablet, mobile |
| RNF-11 | **Usabilidad** | Interfaz intuitiva | Sin capacitación previa |
| RNF-12 | **Mantenibilidad** | Código limpio | Estándares de la industria |
| RNF-13 | **Mantenibilidad** | Documentación | Completa y actualizada |
| RNF-14 | **Costo** | Hosting mensual | < $90/mes |
| RNF-15 | **Compatibilidad** | Navegadores | Chrome, Firefox, Edge, Safari |

---

## 5. RESTRICCIONES Y SUPUESTOS

### 5.1 Restricciones

- **Tiempo:** 5 meses de desarrollo
- **Presupuesto hosting:** Máximo $90/mes
- **Equipo:** 1 desarrollador (estudiante)
- **Tecnología:** Debe ser accesible vía web
- **Formato CSV:** Estructura fija no modificable

### 5.2 Supuestos

- Aljaba S.A. proveerá acceso a ejemplos de CSV reales
- El hosting en nube estará disponible desde el inicio
- La empresa tiene capacidad de internet estable
- Los usuarios tienen navegadores modernos actualizados

---

## 6. CRITERIOS DE ÉXITO

1. **Funcionalidad completa** de importación CSV → generación PDF
2. **Reducción de costos** de $120/mes a máximo $90/mes
3. **Tiempo de generación de catálogo** reducido en al menos 50%
4. **Aprobación de Aljaba S.A.** de la funcionalidad y diseño
5. **Aprobación académica** del proyecto de graduación
6. **Sistema en producción** operando con productos reales

---

## 7. ESTRUCTURA DEL DOCUMENTO

Este documento es parte de un conjunto de documentación técnica que incluye:

1. **DOCUMENTO_PROYECTO.md**
2. **REQUERIMIENTOS_DETALLADOS.md**
3. **ARQUITECTURA_SISTEMA.md**
4. **STACK_TECNOLOGICO.md**
5. **DIAGRAMAS_UML.md**
6. **PLAN_DESARROLLO.md**
7. **ANALISIS_COSTOS.md**

---

**Última actualización:** 14 de febrero de 2026  
**Versión del documento:** 1.0
