# Estimacion de Costos por Puntos de Funcion de Albrecht
## Sistema Catalog Aljaba - Aljaba S.A.

Fecha: 2026
Version: 1.0

---

## 1. Fundamento del Metodo

El metodo de Puntos de Funcion fue propuesto por Allan J. Albrecht en IBM en 1979 y publicado en:

> Albrecht, A. J. (1979). Measuring application development productivity. *Proceedings of the Joint SHARE/GUIDE/IBM Application Development Symposium*, 83-92.

Su proposito es medir el tamano funcional de un sistema de software con independencia del lenguaje de programacion o la tecnologia utilizada, basandose unicamente en lo que el sistema hace desde la perspectiva del usuario. Esto lo hace especialmente util para estimar el esfuerzo de desarrollo antes de escribir una sola linea de codigo.

El metodo fue estandarizado posteriormente por el International Function Point Users Group (IFPUG) en su *Function Point Counting Practices Manual*, del cual se toma la tabla de pesos utilizada en este documento.

> IFPUG. (2010). *Function Point Counting Practices Manual* (Release 4.3.1). International Function Point Users Group.

---

## 2. Componentes del Metodo

El metodo identifica cinco tipos de componentes funcionales:

| Tipo | Sigla | Descripcion |
|------|-------|-------------|
| Entradas Externas | EI | Datos que el usuario ingresa al sistema (formularios, cargas de archivos) |
| Salidas Externas | EO | Datos que el sistema envia al usuario (reportes, descargas, PDFs) |
| Consultas Externas | EQ | Combinaciones entrada-salida sin calculo complejo (busquedas, vistas) |
| Archivos Logicos Internos | ILF | Datos almacenados y gestionados por el sistema (tablas principales de BD) |
| Archivos de Interfaz Externa | EIF | Datos de sistemas externos que el sistema usa pero no mantiene |

Cada componente se clasifica en Simple, Promedio o Complejo y se le asigna un peso segun la siguiente tabla estandar de IFPUG:

| Tipo | Simple | Promedio | Complejo |
|------|--------|----------|---------|
| EI | 3 | 4 | 6 |
| EO | 4 | 5 | 7 |
| EQ | 3 | 4 | 6 |
| ILF | 7 | 10 | 15 |
| EIF | 5 | 7 | 10 |

---

## 3. Identificacion y Conteo de Componentes

### 3.1 Archivos Logicos Internos (ILF)

Son las entidades principales que el sistema almacena y administra en su base de datos.

| # | Archivo Logico Interno | Complejidad | Criterio de clasificacion | Peso |
|---|------------------------|-------------|--------------------------|------|
| 1 | Usuarios (Admin y Guest) | Promedio | 2 tipos de dato con logica de roles y estado activo/inactivo | 10 |
| 2 | Productos | Complejo | 12 atributos: name, code, description, category, 6 precios, stock, image | 15 |
| 3 | Categorias | Promedio | Estructura jerarquica auto-referencial (categoria padre de categoria) | 10 |
| 4 | Categorias Padre | Simple | Entidad de agrupacion con nombre y relacion a multiples categorias | 7 |
| 5 | Imagenes | Promedio | Metadata de archivo: nombre original, URL, thumbnail, dimensiones, s3_key | 10 |
| 6 | Catalogos | Complejo | Configuracion de layout en JSONB, estado guest_visible, relacion a productos | 15 |
| 7 | Catalogo_Productos | Simple | Tabla de relacion muchos-a-muchos con posicion de ordenamiento | 7 |
| | **Total ILF** | | | **74** |

### 3.2 Archivos de Interfaz Externa (EIF)

Son los sistemas externos con los que el sistema interactua pero no controla.

| # | Archivo de Interfaz Externa | Complejidad | Criterio | Peso |
|---|----------------------------|-------------|---------|------|
| 1 | API de DigitalOcean Spaces (S3) | Simple | Operaciones basicas: PUT, GET, DELETE de archivos | 5 |
| 2 | Cloudflare CDN | Simple | Solo entrega de URLs de imagenes, sin logica de negocio | 5 |
| | **Total EIF** | | | **10** |

### 3.3 Entradas Externas (EI)

Son todas las operaciones mediante las cuales el usuario introduce datos al sistema.

#### Modulo de Autenticacion y Usuarios

| # | Entrada Externa | Complejidad | Criterio | Peso |
|---|----------------|-------------|---------|------|
| 1 | Inicio de sesion (Admin) | Simple | 2 campos, 1 tabla afectada | 3 |
| 2 | Inicio de sesion (Guest) | Simple | 2 campos, 1 tabla afectada | 3 |
| 3 | Crear cuenta Guest | Simple | 3 campos, 1 tabla afectada | 3 |
| 4 | Editar cuenta Guest | Simple | 3 campos, 1 tabla afectada | 3 |
| 5 | Activar/desactivar cuenta Guest | Simple | 1 campo, 1 tabla afectada | 3 |
| | Subtotal | | | **15** |

#### Modulo de Productos

| # | Entrada Externa | Complejidad | Criterio | Peso |
|---|----------------|-------------|---------|------|
| 6 | Importar archivo CSV | Complejo | Procesamiento masivo, vinculacion de imagenes, validacion fila a fila, 3+ tablas afectadas | 6 |
| 7 | Crear producto manualmente | Promedio | 11 campos, 2 tablas afectadas (product + image link) | 4 |
| 8 | Editar producto | Promedio | 11 campos, 2 tablas afectadas | 4 |
| 9 | Eliminar producto | Simple | 1 campo, 1 tabla afectada | 3 |
| 10 | Edicion masiva de productos | Complejo | Multiples campos, hasta 500 productos, 2+ tablas afectadas | 6 |
| 11 | Aplicar filtros y busqueda | Promedio | Multiples criterios de filtrado, consulta dinamica | 4 |
| | Subtotal | | | **27** |

#### Modulo de Imagenes

| # | Entrada Externa | Complejidad | Criterio | Peso |
|---|----------------|-------------|---------|------|
| 12 | Cargar imagenes al sistema | Promedio | Validacion de formato, optimizacion con Sharp, upload a S3, 1 tabla afectada | 4 |
| 13 | Editar imagen (editor canvas) | Complejo | Sistema de capas, efectos, mascaras, guardado de version, 2 servicios externos | 6 |
| 14 | Eliminar imagen | Simple | 1 campo, 2 operaciones (BD + S3) | 3 |
| | Subtotal | | | **13** |

#### Modulo de Categorias

| # | Entrada Externa | Complejidad | Criterio | Peso |
|---|----------------|-------------|---------|------|
| 15 | Crear categoria | Simple | 2 campos, 1 tabla afectada | 3 |
| 16 | Editar categoria | Simple | 2 campos, 1 tabla afectada | 3 |
| 17 | Eliminar categoria (con reasignacion) | Simple | 1 campo, 2 tablas afectadas | 3 |
| 18 | Crear categoria padre | Simple | 1 campo, 1 tabla afectada | 3 |
| 19 | Editar categoria padre (agregar/quitar categorias) | Promedio | Relacion muchos-a-muchos, 2 tablas afectadas | 4 |
| 20 | Eliminar categoria padre | Simple | 1 campo, 2 tablas afectadas | 3 |
| | Subtotal | | | **19** |

#### Modulo de Catalogos

| # | Entrada Externa | Complejidad | Criterio | Peso |
|---|----------------|-------------|---------|------|
| 21 | Crear catalogo | Promedio | Config JSONB de layout, 2 campos basicos, 1 tabla afectada | 4 |
| 22 | Agregar/quitar productos del catalogo | Promedio | Operacion sobre tabla relacional con reordenamiento, 2 tablas | 4 |
| 23 | Editar layout y diseno del catalogo | Complejo | Editor visual drag and drop, configuracion de estilos en JSONB, 1 tabla | 6 |
| 24 | Activar/desactivar visibilidad Guest | Simple | 1 campo booleano, 1 tabla afectada | 3 |
| 25 | Eliminar catalogo | Simple | 1 campo, 2 tablas afectadas | 3 |
| | Subtotal | | | **20** |

#### Modulo de PDF

| # | Entrada Externa | Complejidad | Criterio | Peso |
|---|----------------|-------------|---------|------|
| 26 | Generar PDF del catalogo | Complejo | Renderizado con Puppeteer, descarga de imagenes de S3, compilacion multipagina | 6 |
| | Subtotal | | | **6** |

**Total EI = 15 + 27 + 13 + 19 + 20 + 6 = 100**

---

### 3.4 Salidas Externas (EO)

Son los datos procesados que el sistema presenta o entrega al usuario.

| # | Salida Externa | Complejidad | Criterio | Peso |
|---|----------------|-------------|---------|------|
| 1 | Archivo PDF del catalogo generado | Complejo | Multiples paginas, imagenes incrustadas, layouts variables, descarga directa | 7 |
| 2 | Exportacion de productos a CSV | Promedio | Generacion de archivo con 11 columnas, formato especifico, descarga | 5 |
| 3 | Reporte de validacion e importacion CSV | Promedio | Errores, advertencias e imagenes no vinculadas clasificados por fila | 5 |
| 4 | Galeria de imagenes (grid de thumbnails) | Promedio | Visualizacion paginada con metadata de cada imagen | 5 |
| 5 | Dashboard resumen del sistema | Promedio | Contadores de productos, catalogos, imagenes; calculos derivados | 5 |
| 6 | Lista de productos con filtros aplicados | Promedio | Resultados paginados con multiples criterios de filtrado | 5 |
| 7 | Lista de catalogos habilitados (vista Guest) | Simple | Lista filtrada por guest_visible = true, sin logica compleja | 4 |
| 8 | Arbol de categorias y categorias padre | Promedio | Estructura jerarquica renderizada desde consulta recursiva | 5 |
| | **Total EO** | | | **41** |

---

### 3.5 Consultas Externas (EQ)

Son operaciones de entrada-salida sin procesamiento complejo: el usuario pide un dato y el sistema lo recupera y muestra.

| # | Consulta Externa | Complejidad | Criterio | Peso |
|---|-----------------|-------------|---------|------|
| 1 | Resultados de busqueda de productos | Promedio | Consulta con multiples parametros opcionales, respuesta paginada | 4 |
| 2 | Vista de detalle de un producto | Simple | Consulta por ID unico, 1 tabla con JOIN a imagen | 3 |
| 3 | Vista previa del catalogo (antes de PDF) | Promedio | Consulta catalogo + productos + imagenes, renderizado en browser | 4 |
| 4 | Vista de detalle de imagen | Simple | Consulta por ID, metadata de imagen | 3 |
| 5 | Lista de catalogos habilitados para Guest | Simple | SELECT WHERE guest_visible = true, sin procesamiento adicional | 3 |
| 6 | Contenido de un catalogo (Guest lo visualiza) | Promedio | Catalogo + productos + imagenes, validacion de permiso guest | 4 |
| 7 | Lista de usuarios Guest | Simple | SELECT con filtro de rol, 1 tabla | 3 |
| 8 | Consulta del arbol de categorias | Promedio | Consulta jerarquica con JOIN a categoria padre | 4 |
| | **Total EQ** | | | **28** |

---

## 4. Puntos de Funcion Sin Ajustar (UFP)

| Tipo de Componente | Conteo | Total Ponderado |
|--------------------|--------|-----------------|
| Entradas Externas (EI) | 26 funciones | 100 |
| Salidas Externas (EO) | 8 funciones | 41 |
| Consultas Externas (EQ) | 8 funciones | 28 |
| Archivos Logicos Internos (ILF) | 7 archivos | 74 |
| Archivos de Interfaz Externa (EIF) | 2 archivos | 10 |
| **TOTAL UFP** | **51 componentes** | **253** |

---

## 5. Factor de Ajuste de Valor (VAF)

El VAF se calcula a partir de 14 Caracteristicas Generales del Sistema (CGS), cada una evaluada en una escala de 0 a 5, donde 0 significa sin influencia y 5 significa influencia fuerte.

Referencia metodologica: IFPUG (2010), capitulo 4, "Value Adjustment Factor".

| # | Caracteristica General del Sistema | Valor (0-5) | Justificacion |
|---|-----------------------------------|-------------|---------------|
| 1 | Comunicacion de datos | 4 | Sistema web con API REST, comunicacion continua cliente-servidor via HTTPS |
| 2 | Procesamiento distribuido | 2 | Arquitectura cliente-servidor basica, sin microservicios ni colas de mensajes |
| 3 | Rendimiento | 3 | La generacion de PDFs con Puppeteer es demandante; el resto del sistema es moderado |
| 4 | Configuracion de uso intensivo | 2 | Empresa pequena, maximo 50 usuarios concurrentes estimados |
| 5 | Tasa de transacciones | 2 | Volumen de transacciones moderado, sin picos de alta frecuencia |
| 6 | Entrada de datos en linea | 5 | La interfaz web es el unico modo de interaccion; toda entrada es en linea |
| 7 | Eficiencia del usuario final | 4 | Disenado para uso sin capacitacion previa, interfaz intuitiva requerida |
| 8 | Actualizacion en linea | 4 | Productos, catalogos e imagenes se actualizan en tiempo real sin reinicios |
| 9 | Procesamiento complejo | 4 | Editor de imagenes con capas (Fabric.js), generador de PDF (Puppeteer), vinculacion automatica de imagenes |
| 10 | Reusabilidad | 3 | Componentes React reutilizables, servicios del backend modulares |
| 11 | Facilidad de instalacion | 2 | Despliegue en nube con GitHub Actions, proceso automatizado una sola vez |
| 12 | Facilidad de operacion | 3 | Panel administrativo con indicadores; monitoreo basico incluido |
| 13 | Instalaciones multiples | 1 | Sistema para una sola empresa en un solo ambiente de produccion |
| 14 | Facilitar el cambio | 3 | Formato CSV adaptable, categorias editables, layouts de catalogo configurables |
| | **Suma de CGS** | **42** | |

**Formula del VAF:**

```
VAF = 0.65 + (0.01 x Suma de CGS)
VAF = 0.65 + (0.01 x 42)
VAF = 0.65 + 0.42
VAF = 1.07
```

---

## 6. Puntos de Funcion Ajustados (AFP)

```
AFP = UFP x VAF
AFP = 253 x 1.07
AFP = 270.71 ~ 271 Puntos de Funcion
```

**El sistema Catalog Aljaba tiene un tamano funcional de 271 Puntos de Funcion Ajustados.**

---

## 7. Conversion de Puntos de Funcion a Horas de Desarrollo

### 7.1 Tasa de Productividad

La conversion de puntos de funcion a horas depende de la productividad del equipo de desarrollo, el lenguaje de programacion y el nivel de madurez tecnologica. Capers Jones, investigador referente en la materia, documenta los siguientes rangos tipicos:

> Jones, C. (2007). *Estimating Software Costs: Bringing Realism to Estimating* (2a ed.). McGraw-Hill.

Segun Jones, para sistemas de informacion empresariales en lenguajes de cuarta generacion o frameworks modernos, la productividad oscila entre 3 y 8 horas por punto de funcion para desarrolladores con conocimiento del stack.

Para este proyecto se justifica el uso de **3 horas por punto de funcion** por las siguientes razones:

1. **Stack de alta productividad:** React con Material-UI provee componentes listos que eliminan el trabajo de diseno de interfaz desde cero. Prisma ORM genera el cliente de base de datos automaticamente. Vite configura el entorno sin esfuerzo manual.

2. **Librerias especializadas:** Fabric.js abstrae la complejidad del editor canvas. Puppeteer abstrae la generacion de PDFs. Sharp abstrae el procesamiento de imagenes. El desarrollador integra, no implementa desde cero.

3. **Patrones establecidos:** La arquitectura REST con Node.js y Express esta ampliamente documentada. El uso de TypeScript con Zod reduce errores en tiempo de desarrollo.

4. **Alcance acotado:** Un solo desarrollador, un solo cliente, requerimientos definidos desde el inicio. No hay overhead de coordinacion de equipo ni cambios de requerimientos frecuentes.

### 7.2 Calculo de Horas Totales

```
Horas totales = AFP x Tasa de productividad
Horas totales = 271 x 3 horas/PF
Horas totales = 813 horas ~ 800 horas
```

### 7.3 Validacion con el Cronograma del Proyecto

El proyecto tiene una duracion maxima de 6 meses. Considerando una jornada de trabajo de 40 horas semanales:

```
Horas disponibles = 4 semanas/mes x 40 horas/semana x 6 meses = 960 horas disponibles
Horas requeridas = 813 horas

Porcentaje de uso = 813 / 960 = 84.7%
```

Las 813 horas estimadas representan el 84.7% de la capacidad disponible en 6 meses, lo cual es realista al reservar el 15.3% restante para pruebas, correcciones, documentacion y despliegue. Esto valida que el proyecto es completamente viable dentro del plazo establecido.

Si se toma como referencia exacta las 800 horas acordadas como maximo:

```
800 horas / 5 meses = 160 horas/mes
160 horas/mes / 4 semanas = 40 horas/semana
```

La carga es de 40 horas semanales durante 5 meses, lo cual corresponde a una dedicacion de tiempo completo, consistente con el compromiso de graduacion del desarrollador.

---

## 8. Analisis de Costos por Categoria

### 8.1 Costo de Desarrollo

#### Costo directo para Aljaba S.A.

El desarrollo del sistema sera ejecutado de forma voluntaria por el programador como parte de su proyecto de graduacion, en agradecimiento a la oportunidad brindada por la empresa. No se acorde compensacion economica alguna.

| Concepto | Costo para Aljaba S.A. |
|----------|----------------------|
| Horas de programacion (813 horas) | Q 0.00 |
| Licencias de software (todas open source) | Q 0.00 |
| Herramientas de desarrollo (VS Code, Git, Docker) | Q 0.00 |
| **Total costo de desarrollo para Aljaba S.A.** | **Q 0.00** |

#### Valor economico de mercado del desarrollo

Aunque el costo para la empresa es cero, el trabajo tiene un valor de mercado documentable. Con base en ofertas de empleo activas en CompuTrabajo Guatemala y Encuentra24 para perfiles de desarrollador web full-stack con conocimiento en React y Node.js, el salario mensual para un perfil junior o semi-junior se situa en aproximadamente Q8,000.00 mensuales.

```
Costo hora de mercado = Q8,000.00 / 160 horas al mes = Q50.00 por hora

Valor de mercado del desarrollo = 813 horas x Q50.00/hora = Q40,650.00
```

Redondeando al mes completo mas cercano (5 meses a Q8,000.00/mes):

```
Valor de mercado = 5 meses x Q8,000.00 = Q40,000.00
```

| Concepto | Valor de Mercado (referencia) |
|----------|------------------------------|
| 813 horas de desarrollo (Q50/hora) | Q 40,650.00 |
| Equivalente en USD (tipo de cambio Q7.70) | $ 5,279.22 |
| **Ahorro para Aljaba S.A.** | **Q 40,650.00** |

---

### 8.2 Costo de Despliegue

El despliegue es la puesta en marcha del sistema en el ambiente de produccion en la nube. Esta actividad esta incluida dentro de las 813 horas de desarrollo estimadas; no representa un costo adicional ni en tiempo ni en dinero.

Las tareas de despliegue comprenden: configuracion de DigitalOcean App Platform, configuracion de la base de datos administrada, configuracion de DigitalOcean Spaces, integracion con Cloudflare y configuracion del pipeline de CI/CD con GitHub Actions. Estas actividades se estiman en aproximadamente 8 a 12 horas, ya incluidas en el total.

| Concepto | Costo para Aljaba S.A. |
|----------|----------------------|
| Configuracion de infraestructura en nube | Q 0.00 |
| Configuracion de CI/CD y automatizacion | Q 0.00 |
| Configuracion de dominio y SSL | Q 0.00 |
| **Total costo de despliegue** | **Q 0.00** |

---

### 8.3 Costo de Integracion en la Empresa

La integracion comprende el proceso de incorporar el sistema al flujo de trabajo de Aljaba S.A. Incluye capacitacion del personal administrativo y de los empleados ruteros, y la migracion inicial de datos desde el archivo CSV existente.

| Concepto | Horas estimadas | Costo |
|----------|----------------|-------|
| Capacitacion usuarios Admin (2 personas, 4 horas c/u) | 8 horas | Q 0.00 |
| Capacitacion usuarios Guest/ruteros (estimado 10 personas, 1 hora c/u) | 10 horas | Q 0.00 |
| Carga inicial del CSV de productos existente | 2 horas | Q 0.00 |
| Carga inicial de imagenes de productos existentes | 3 horas | Q 0.00 |
| Soporte durante el primer mes de operacion | 10 horas | Q 0.00 |
| **Total costo de integracion** | **33 horas** | **Q 0.00** |

Estas horas de integracion estan incluidas dentro del presupuesto total de 813 horas. El personal de Aljaba que recibe la capacitacion ya forma parte de la nomina de la empresa; no representa un costo adicional para la organizacion.

---

### 8.4 Costo de Mantenimiento Mensual

El mantenimiento del sistema en produccion tiene dos componentes: la infraestructura tecnologica en la nube, que corre por cuenta de Aljaba S.A., y el mantenimiento de software, que es donado por el desarrollador bajo el mismo acuerdo del proyecto.

#### Infraestructura mensual (a cargo de Aljaba S.A.)

Los precios corresponden a los planes contratados en DigitalOcean segun su pagina oficial de precios, y a servicios gratuitos de Cloudflare, GitHub y Uptime Robot.

| Servicio | Proveedor | Plan | Costo/mes (USD) | Costo/mes (Q) |
|----------|-----------|------|-----------------|----------------|
| Hosting de la aplicacion web | DigitalOcean App Platform | 1 vCPU, 1 GIB RAM, 150 GIB transfer | $ 12.00 | Q 92.40 |
| Base de datos PostgreSQL administrada | DigitalOcean Managed DB | 1 vCPU, 1 GIB RAM, 10 GIB disco | $ 15.15 | Q 116.66 |
| Almacenamiento de imagenes con CDN | DigitalOcean Spaces | 250 GIB storage, 1 TIB transfer | $ 5.00 | Q 38.50 |
| SSL / HTTPS / CDN de la aplicacion | Cloudflare | Free | $ 0.00 | Q 0.00 |
| Pipeline CI/CD automatico | GitHub Actions | Free | $ 0.00 | Q 0.00 |
| Monitoreo de disponibilidad | Uptime Robot | Free | $ 0.00 | Q 0.00 |
| **Total mensual** | | | **$ 32.15** | **Q 247.56** |

*Tipo de cambio referencial: Q7.70 por USD.*

#### Mantenimiento de software (donado por el desarrollador)

El mantenimiento correctivo (correccion de errores) y adaptativo (actualizacion de dependencias de seguridad) sera atendido por el desarrollador sin costo adicional para la empresa, bajo el mismo espiritu de colaboracion del proyecto.

| Concepto | Costo para Aljaba S.A. |
|----------|----------------------|
| Correccion de errores en produccion | Q 0.00 |
| Actualizaciones de seguridad del sistema | Q 0.00 |
| Ajustes menores al sistema | Q 0.00 |
| **Total mantenimiento de software** | **Q 0.00** |

---

## 9. Resumen General de Costos

### 9.1 Costo Total del Proyecto para Aljaba S.A.

| Categoria | Costo Directo para Aljaba S.A. | Valor de Mercado (referencia) |
|-----------|-------------------------------|------------------------------|
| Desarrollo (813 horas) | Q 0.00 | Q 40,650.00 |
| Despliegue inicial | Q 0.00 | Incluido arriba |
| Integracion en la empresa | Q 0.00 | Incluido arriba |
| **Total inversion del proyecto** | **Q 0.00** | **Q 40,650.00** |

### 9.2 Costo Operativo Mensual en Produccion

| Concepto | Mensual (USD) | Mensual (Q) | Anual (USD) | Anual (Q) |
|----------|--------------|-------------|-------------|-----------|
| Infraestructura (a cargo de Aljaba) | $ 32.15 | Q 247.56 | $ 385.80 | Q 2,970.66 |
| Mantenimiento de software | $ 0.00 | Q 0.00 | $ 0.00 | Q 0.00 |
| **Total mensual** | **$ 32.15** | **Q 247.56** | **$ 385.80** | **Q 2,970.66** |

### 9.3 Comparacion con el Gasto Actual de Aljaba S.A.

| Concepto | Situacion Actual | Sistema Propuesto | Diferencia |
|----------|-----------------|-------------------|------------|
| Catalog Machine | $ 120.00 / mes | $ 0.00 | - $ 120.00 |
| Infraestructura propia | $ 0.00 | $ 32.15 / mes | + $ 32.15 |
| **Total mensual** | **$ 120.00** | **$ 32.15** | **- $ 87.85** |
| **Ahorro mensual** | | | **73.2%** |
| **Ahorro anual** | | | **$ 1,054.20** |

### 9.4 Proyeccion de Ahorro a 3 Anos

```
Ahorro mensual:      $87.85
Ahorro anual:        $87.85 x 12 = $1,054.20
Ahorro en 3 anos:    $87.85 x 36 = $3,162.60
En quetzales:        Q3,162.60 x 7.70 = Q24,352.02
```

La empresa recupera el valor de mercado del desarrollo (Q40,650.00) en terminos de ahorro acumulado en aproximadamente 38 meses de operacion, contando unicamente el ahorro de Catalog Machine y sin considerar los ahorros futuros probables en Canva Pro y Postimages Pro.

---

## 10. Tabla de Metricas del Proyecto

| Metrica | Valor |
|---------|-------|
| Puntos de Funcion Sin Ajustar (UFP) | 253 |
| Suma de Caracteristicas Generales del Sistema | 42 |
| Factor de Ajuste de Valor (VAF) | 1.07 |
| Puntos de Funcion Ajustados (AFP) | 271 |
| Tasa de productividad | 3 horas / PF |
| Esfuerzo estimado | 813 horas |
| Duracion del proyecto | 5 a 6 meses |
| Costo directo de desarrollo para Aljaba S.A. | Q 0.00 |
| Valor de mercado del desarrollo | Q 40,650.00 |
| Costo mensual de infraestructura en produccion | $ 32.15 USD |
| Ahorro mensual frente a situacion actual | $ 87.85 USD (73.2%) |

---

## 11. Referencias Bibliograficas del Metodo

Albrecht, A. J. (1979). Measuring application development productivity. *Proceedings of the Joint SHARE/GUIDE/IBM Application Development Symposium*, 83-92.

IFPUG. (2010). *Function Point Counting Practices Manual* (Release 4.3.1). International Function Point Users Group. https://www.ifpug.org

Jones, C. (2007). *Estimating Software Costs: Bringing Realism to Estimating* (2a ed.). McGraw-Hill.

DigitalOcean. (s.f.). *Pricing*. Recuperado de https://www.digitalocean.com/pricing

Cloudflare. (s.f.). *Plans*. Recuperado de https://www.cloudflare.com/plans

---

**Elaborado por:** [Nombre del estudiante]
**Fecha:** 2026
**Version:** 1.0
