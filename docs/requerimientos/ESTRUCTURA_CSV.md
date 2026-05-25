# Estructura del Archivo CSV - Aljaba S.A.

## Formato Acordado con la Empresa

Este documento describe la estructura FIJA del archivo CSV que Aljaba S.A. utiliza para gestionar sus productos.

La columna `image` ha sido eliminada del CSV. La vinculacion de imagenes a productos es automatica y se basa en el nombre del archivo de imagen, el cual debe coincidir (de forma insensible a mayusculas/minusculas) con el campo `code` del producto. Ver seccion "Proceso de Pre-importacion" mas abajo.

---

## Estructura de Columnas

```
Name | code | description | category | price1 | price2 | price3 | price4 | price5 | price6 | Stock Quality
```

---

## Descripcion Detallada de Cada Campo

| # | Nombre Campo | Tipo de Dato | Obligatorio | Descripcion | Ejemplo |
|---|--------------|--------------|-------------|-------------|---------|
| 1 | **Name** | String | Si | Nombre descriptivo del producto | "Bombilla LED 75W" |
| 2 | **code** | String | Si | Codigo unico del producto. Debe coincidir con el nombre del archivo de imagen ya subido (sin extension, insensible a mayusculas/minusculas) | "GE-75003WW" |
| 3 | **description** | Text | Si | Descripcion detallada del producto | "BOMB LED G" |
| 4 | **category** | String | Si | Categoria del producto | "Iluminacion" |
| 5 | **price1** | Decimal | Si | Precio para cantidad 1 (generalmente unidad) | 12 |
| 6 | **price2** | Decimal | No | Precio para cantidad 2 (ej: docena) | 36.84 |
| 7 | **price3** | Decimal | No | Precio para cantidad 3 | 24 |
| 8 | **price4** | Decimal | No | Precio para cantidad 4 | 33.15 |
| 9 | **price5** | Decimal | No | Precio para cantidad 5 | 48 |
| 10 | **price6** | Decimal | No | Precio para cantidad 6 | 29.47 |
| 11 | **Stock Quality** | Integer | Si | Cantidad disponible en inventario | 208 |

---

## Proceso de Pre-importacion: Carga de Imagenes

Antes de importar el CSV, el administrador debe subir las imagenes al sistema. El orden correcto de trabajo es:

```
Paso 1: Subir imagenes al sistema (Modulo de Imagenes)
        El nombre del archivo de cada imagen debe ser igual al code del producto.
        Ejemplo: producto con code "GE-75003WW" -> subir "GE-75003WW.jpg"
        |
        v
Paso 2: Importar el archivo CSV (Modulo de Productos)
        El sistema lee la columna code de cada fila y busca automaticamente
        la imagen con ese mismo nombre en la galeria.
        |
        v
Paso 3: Revisar el reporte de importacion
        El sistema informa que productos quedaron sin imagen vinculada.
```

**Convencion de nombres para archivos de imagen:**
- El nombre del archivo (sin extension) debe corresponder al valor del campo `code` en el CSV
- La comparacion es **insensible a mayusculas/minusculas (case-insensitive)**: el sistema convierte ambos a minusculas antes de comparar
- Extensiones aceptadas: `.jpg`, `.jpeg`, `.png`, `.webp`
- Los codigos pueden contener guiones, numeros y letras; todos son validos como nombres de archivo

Ejemplos validos:

| code en CSV | Nombre de archivo de imagen | Resultado |
|-------------|----------------------------|-----------|
| GE-75003WW | GE-75003WW.jpg | Vincula |
| GE-75003WW | ge-75003ww.jpg | Vincula (case-insensitive) |
| GE-75003WW | GE-75003WW.PNG | Vincula (case-insensitive) |
| 18258-119 | 18258-119.jpg | Vincula |
| JT-FYTJGK-500WW | JT-FYTJGK-500WW.webp | Vincula |
| 7186 | 7186.png | Vincula |
| 2 | 2.jpg | Vincula |

---

## Ejemplo Real del CSV

### Estructura Actual (11 columnas, sin columna image)
```csv
Name,code,description,category,price1,price2,price3,price4,price5,price6,Stock Quality
Bombilla LED 75W,GE-75003WW,BOMB LED G,Iluminacion,12,36.84,24,33.15,48,29.47,208
```

### Vista Estructurada

| Campo | Valor |
|-------|-------|
| Name | Bombilla LED 75W |
| code | GE-75003WW |
| description | BOMB LED G |
| category | Iluminacion |
| price1 | 12 |
| price2 | 36.84 |
| price3 | 24 |
| price4 | 33.15 |
| price5 | 48 |
| price6 | 29.47 |
| Stock Quality | 208 |

La imagen de este producto debera haberse subido previamente con el nombre `GE-75003WW.jpg` (o `.png` / `.webp`).

---

## Reglas de Validacion del CSV

### 1. Estructura del Archivo
- Debe ser archivo `.csv`
- Primera fila debe ser el encabezado con nombres exactos
- Separador: coma (`,`)
- Codificacion: UTF-8

### 2. Validacion de Columnas
- Debe tener exactamente 11 columnas
- Nombres de columnas deben coincidir exactamente (case-sensitive)
- Orden de columnas debe mantenerse
- Si se detecta una columna `image`, se considera formato antiguo y se rechaza con error critico

### 3. Campos Obligatorios
```
Name:          debe tener valor
code:          debe tener valor Y ser unico
description:   debe tener valor
category:      debe tener valor
price1:        debe tener valor Y ser numero positivo
Stock Quality: debe tener valor Y ser entero >= 0
```

### 4. Tipos de Datos
```
String:   Name, code, description, category
Decimal:  price1, price2, price3, price4, price5, price6
Integer:  Stock Quality
```

### 5. Precios
- `price1` es obligatorio
- `price2` a `price6` son opcionales
- Todos los precios deben ser >= 0
- Formato: numeros con hasta 2 decimales

### 6. Imagen (Advertencia, no error critico)
- El sistema busca en la galeria una imagen cuyo nombre sin extension coincida con el campo `code`
- Si no encuentra imagen, registra advertencia y el producto se importa sin imagen
- Si encuentra coincidencia, la vincula automaticamente al producto

### 7. Unicidad de Codigo
- Si el codigo ya existe, el sistema pregunta al usuario si actualizar o ignorar la fila

---

## Comportamiento del Importador

### Flujo de Importacion

```
1. Administrador sube las imagenes (nombres = code de los productos)
   |
   v
2. Administrador sube el archivo CSV
   |
   v
3. Sistema valida extension (.csv)
   |
   v
4. Sistema valida estructura (11 columnas, nombres correctos)
   |
   v
5. Para cada fila:
   - Validar campos obligatorios presentes
   - Validar tipos de datos
   - Validar codigo unico
   - Buscar imagen con nombre = code del producto
     Si encuentra: vincular imagen al producto
     Si no encuentra: registrar advertencia
   |
   v
6. Generar reporte de validacion:
   - Filas validas: X
   - Filas con errores: Y
   - Productos sin imagen encontrada: Z
   - Detalles por fila
   |
   v
7. Usuario decide continuar o cancelar
   |
   v
8. Importacion de filas validas con imagen vinculada (si la hay)
   |
   v
9. Resumen final:
   - Productos importados con imagen: X
   - Productos importados sin imagen: Y
   - Productos actualizados: Z
   - Productos omitidos: W
```

---

## Tipos de Errores

### Errores Criticos (Detienen importacion completa)

| Error | Descripcion | Solucion |
|-------|-------------|----------|
| Archivo no CSV | Extension incorrecta | Convertir a .csv |
| Estructura incorrecta | No tiene 11 columnas | Revisar encabezado |
| Columna `image` presente | Formato antiguo detectado | Eliminar la columna image del archivo |
| Nombres de columnas erroneos | No coinciden exactamente | Corregir nombres |
| Codificacion incorrecta | Caracteres invalidos | Guardar como UTF-8 |

### Errores por Fila (La fila se omite)

| Error | Descripcion |
|-------|-------------|
| Campo obligatorio vacio | Name, code, description, category, price1 o Stock Quality vacio |
| Precio invalido | No es numero o es negativo |
| Stock invalido | No es entero o es negativo |

### Advertencias por Fila (El producto se importa con aviso)

| Advertencia | Descripcion |
|-------------|-------------|
| Imagen no encontrada | No existe imagen con nombre igual al code del producto |
| Codigo duplicado | El code ya existe; el sistema pide confirmacion |
| Precio2-6 con valor no numerico | Campo opcional con formato incorrecto; se omite ese precio |

---

## Manejo de Categorias en el CSV

El campo `category` es un string simple con el nombre de la categoria directa del producto.

- Puede contener subcategorias separadas por `/` o `>`:
  - Ejemplo: `Iluminacion/Bombillas LED`
  - Ejemplo: `Plomeria > Tuberias`
- Si la categoria no existe, se crea automaticamente
- La asignacion a una categoria padre se realiza desde el panel de administracion de categorias, no desde el CSV

---

## Formato de Exportacion

Al exportar productos del sistema, el archivo tendra la misma estructura de 11 columnas:

```csv
Name,code,description,category,price1,price2,price3,price4,price5,price6,Stock Quality
Bombilla LED 75W,GE-75003WW,Descripcion 1,Iluminacion,10.50,9.80,9.50,9.20,9.00,8.80,150
Caja de Interruptor,18258-119,Descripcion 2,Electrico,20.00,,,,,, 100
```

Campos vacios se dejan sin valor (comas consecutivas).

---

## Pseudocodigo de Validacion

```javascript
function validateCSVRow(row, rowNumber, imageGallery) {
  const errors = [];
  const warnings = [];

  if (!row.Name) errors.push(`Fila ${rowNumber}: Name vacio`);
  if (!row.code) errors.push(`Fila ${rowNumber}: code vacio`);
  if (!row.description) errors.push(`Fila ${rowNumber}: description vacio`);
  if (!row.category) errors.push(`Fila ${rowNumber}: category vacio`);

  if (!row.price1) {
    errors.push(`Fila ${rowNumber}: price1 vacio`);
  } else if (isNaN(row.price1) || row.price1 < 0) {
    errors.push(`Fila ${rowNumber}: price1 debe ser numero positivo`);
  }

  if (row['Stock Quality'] === undefined || row['Stock Quality'] === '') {
    errors.push(`Fila ${rowNumber}: Stock Quality vacio`);
  } else if (!Number.isInteger(Number(row['Stock Quality'])) || Number(row['Stock Quality']) < 0) {
    errors.push(`Fila ${rowNumber}: Stock Quality debe ser entero >= 0`);
  }

  for (let i = 2; i <= 6; i++) {
    const priceField = `price${i}`;
    if (row[priceField] && (isNaN(row[priceField]) || row[priceField] < 0)) {
      warnings.push(`Fila ${rowNumber}: ${priceField} no es numero valido, se omitira`);
    }
  }

  if (codeExistsInDatabase(row.code)) {
    warnings.push(`Fila ${rowNumber}: codigo ${row.code} ya existe, se pedira confirmacion`);
  }

  // La vinculacion de imagen se realiza por el campo code, no por Name
  const imageFound = imageGallery.find(
    img => img.nameWithoutExtension.toLowerCase() === row.code.toLowerCase()
  );
  if (!imageFound) {
    warnings.push(`Fila ${rowNumber}: no se encontro imagen con nombre "${row.code}", producto importado sin imagen`);
  }

  return {
    valid: errors.length === 0,
    imageLinked: !!imageFound,
    imageId: imageFound ? imageFound.id : null,
    errors,
    warnings
  };
}
```

---

## Casos de Prueba

| # | Caso de Prueba | Resultado Esperado |
|---|----------------|-------------------|
| 1 | CSV de 11 columnas con datos validos e imagenes subidas | Importacion exitosa con imagenes vinculadas |
| 2 | CSV de 12 columnas (con columna image del formato antiguo) | Error critico: formato antiguo no valido |
| 3 | CSV sin encabezado | Error critico |
| 4 | CSV con code que tiene imagen subida con mismo nombre | Producto importado con imagen vinculada |
| 5 | CSV con code sin imagen correspondiente en galeria | Producto importado sin imagen, advertencia mostrada |
| 6 | Fila con code duplicado | Advertencia, preguntar al usuario |
| 7 | Fila con price1 vacio | Fila invalida |
| 8 | Fila con price2-6 vacios | Fila valida (precios opcionales) |
| 9 | CSV con 4,000 filas | Importacion completa en menos de 30 segundos |
| 10 | CSV con caracteres especiales (n, a, e con tildes) | Importacion correcta (UTF-8) |
| 11 | Imagen subida con nombre igual al code (ej: "GE-75003WW.jpg") | Se vincula al producto con code "GE-75003WW" |
| 12 | code con guiones (ej: "18258-119") | Vinculacion correcta con imagen "18258-119.jpg" |
| 13 | code muy corto (ej: "2") | Vinculacion correcta con imagen "2.jpg" |

---

**Ultima actualizacion:** 24 de mayo de 2026
**Version:** 3.0 (vinculacion automatica cambiada de campo Name a campo code)
