# Estructura del Archivo CSV - Aljaba S.A.

## Formato Acordado con la Empresa

Este documento describe la estructura FIJA del archivo CSV que Aljaba S.A. utiliza para gestionar sus productos.

Cambio importante respecto a la version anterior:
La columna `image` ha sido eliminada del CSV. La vinculacion de imagenes a productos ahora es automatica y se basa en el nombre del archivo de imagen, el cual debe coincidir exactamente con el campo `Name` del producto. Ver seccion "Proceso de Pre-importacion" mas abajo.

---

## Estructura de Columnas

```
Name | code | description | category | price1 | price2 | price3 | price4 | price5 | price6 | Stock Quality
```

---

## Descripcion Detallada de Cada Campo

| # | Nombre Campo | Tipo de Dato | Obligatorio | Descripcion | Ejemplo |
|---|--------------|--------------|-------------|-------------|---------|
| 1 | **Name** | String | Si | Nombre del producto. Debe coincidir con el nombre del archivo de imagen ya subido (sin extension) | "001lampara" |
| 2 | **code** | String | Si | Codigo unico del producto | "GE-75003WM" |
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
        El nombre del archivo de cada imagen debe ser igual al Name del producto.
        Ejemplo: producto con Name "001lampara" -> subir "001lampara.jpg"
        |
        v
Paso 2: Importar el archivo CSV (Modulo de Productos)
        El sistema lee la columna Name de cada fila y busca automaticamente
        la imagen con ese mismo nombre en la galeria.
        |
        v
Paso 3: Revisar el reporte de importacion
        El sistema informa que productos quedaron sin imagen vinculada.
```

**Convencion de nombres para archivos de imagen:**
- El nombre del archivo (sin extension) debe ser identico al valor del campo `Name` en el CSV
- La comparacion es exacta y sensible a mayusculas/minusculas
- Extensiones aceptadas: `.jpg`, `.jpeg`, `.png`, `.webp`

Ejemplos correctos:

| Name en CSV | Nombre de archivo de imagen |
|-------------|----------------------------|
| 001lampara | 001lampara.jpg |
| GE-75003WM-bombilla | GE-75003WM-bombilla.png |
| tuberiaA12 | tuberiaA12.webp |

---

## Ejemplo Real del CSV

### Estructura Actual (11 columnas, sin columna image)
```csv
Name,code,description,category,price1,price2,price3,price4,price5,price6,Stock Quality
001lampara,GE-75003WM,BOMB LED G,Iluminacion,12,36.84,24,33.15,48,29.47,208
```

### Vista Estructurada

| Campo | Valor |
|-------|-------|
| Name | 001lampara |
| code | GE-75003WM |
| description | BOMB LED G |
| category | Iluminacion |
| price1 | 12 |
| price2 | 36.84 |
| price3 | 24 |
| price4 | 33.15 |
| price5 | 48 |
| price6 | 29.47 |
| Stock Quality | 208 |

La imagen de este producto debera haberse subido previamente con el nombre `001lampara.jpg` (o `.png` / `.webp`).

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
- El sistema busca en la galeria una imagen cuyo nombre sin extension coincida con el campo `Name`
- Si no encuentra imagen, registra advertencia y el producto se importa sin imagen
- Si encuentra coincidencia, la vincula automaticamente al producto

### 7. Unicidad de Codigo
- Si el codigo ya existe, el sistema pregunta al usuario si actualizar o ignorar la fila

---

## Comportamiento del Importador

### Flujo de Importacion

```
1. Administrador sube las imagenes (nombres = Name de los productos)
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
   - Buscar imagen con nombre = Name del producto
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
| Imagen no encontrada | No existe imagen con nombre igual al Name del producto |
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
Producto1,ABC-001,Descripcion 1,Categoria A,10.50,9.80,9.50,9.20,9.00,8.80,150
Producto2,ABC-002,Descripcion 2,Categoria B,20.00,,,,,, 100
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

  const imageFound = imageGallery.find(
    img => img.nameWithoutExtension === row.Name
  );
  if (!imageFound) {
    warnings.push(`Fila ${rowNumber}: no se encontro imagen con nombre "${row.Name}", producto importado sin imagen`);
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
| 4 | CSV con Name que tiene imagen subida con mismo nombre | Producto importado con imagen vinculada |
| 5 | CSV con Name sin imagen correspondiente en galeria | Producto importado sin imagen, advertencia mostrada |
| 6 | Fila con code duplicado | Advertencia, preguntar al usuario |
| 7 | Fila con price1 vacio | Fila invalida |
| 8 | Fila con price2-6 vacios | Fila valida (precios opcionales) |
| 9 | CSV con 4,000 filas | Importacion completa en menos de 30 segundos |
| 10 | CSV con caracteres especiales (n, a, e con tildes) | Importacion correcta (UTF-8) |
| 11 | Imagen duplicada en galeria (mismo nombre dos veces) | Alerta al Admin, se usa la mas reciente |

---

**Ultima actualizacion:** 20 de febrero de 2026
**Version:** 2.0 (columna image eliminada, vinculacion automatica por nombre)
