# Estructura del Archivo CSV - Aljaba S.A.

## Formato Acordado con la Empresa

Este documento describe la estructura **FIJA** del archivo CSV que Aljaba S.A. utiliza para gestionar sus productos. El sistema debe validar y mantener exactamente este formato.

---

## Estructura de Columnas

### Vista de las Columnas
```
Name | code | description | category | price1 | price2 | price3 | price4 | price5 | price6 | image | Stock Quality
```

---

## Descripción Detallada de Cada Campo

| # | Nombre Campo | Tipo de Dato | Obligatorio | Descripción | Ejemplo |
|---|--------------|--------------|-------------|-------------|---------|
| 1 | **Name** | String |  Sí | Nombre completo del producto | "001lampara" |
| 2 | **code** | String |  Sí | Código único del producto | "GE-75003WM" |
| 3 | **description** | Text |  Sí | Descripción detallada del producto | "BOMB LED G" |
| 4 | **category** | String |  Sí | Categoría del producto | "Iluminación" |
| 5 | **price1** | Decimal |  Sí | Precio para cantidad 1 (generalmente unidad) | 12 |
| 6 | **price2** | Decimal |  No | Precio para cantidad 2 (ej: docena) | 36.84 |
| 7 | **price3** | Decimal |  No | Precio para cantidad 3 | 24 |
| 8 | **price4** | Decimal |  No | Precio para cantidad 4 | 33.15 |
| 9 | **price5** | Decimal |  No | Precio para cantidad 5 | 48 |
| 10 | **price6** | Decimal |  No | Precio para cantidad 6 | 29.47 |
| 11 | **image** | URL |  Sí | URL de la imagen del producto | "https://i.pos..." |
| 12 | **Stock Quality** | Integer |  Sí | Cantidad disponible en inventario | 208 |

---

## Ejemplo Real del CSV

### Datos de Referencia (Fila 1)
```csv
Name,code,description,category,price1,price2,price3,price4,price5,price6,image,Stock Quality
001lampara,GE-75003WM,BOMB LED G,Iluminación,12,36.84,24,33.15,48,29.47,https://i.pos,208
```

### Vista Estructurada
| Campo | Valor |
|-------|-------|
| Name | 001lampara |
| code | GE-75003WM |
| description | BOMB LED G |
| category | Iluminación |
| price1 | 12 |
| price2 | 36.84 |
| price3 | 24 |
| price4 | 33.15 |
| price5 | 48 |
| price6 | 29.47 |
| image | https://i.pos |
| Stock Quality | 208 |

---

## Reglas de Validación del CSV

### Validaciones Obligatorias

#### 1. Estructura del Archivo
-  Debe ser archivo `.csv` (Comma-Separated Values)
-  Primera fila debe ser el encabezado con nombres exactos
-  Separador: coma (`,`)
-  Codificación: UTF-8 (para caracteres especiales en español)

#### 2. Validación de Columnas
-  Debe tener exactamente 12 columnas
-  Nombres de columnas deben coincidir exactamente (case-sensitive)
-  Orden de columnas debe mantenerse

#### 3. Validación de Campos Obligatorios
```
Campo Obligatorio = No puede estar vacío

 Name:          debe tener valor
 code:          debe tener valor Y ser único
 description:   debe tener valor
 category:      debe tener valor
 price1:        debe tener valor Y ser número positivo
 image:         debe tener valor (URL válida)
 Stock Quality: debe tener valor Y ser número entero >= 0
```

#### 4. Validación de Tipos de Datos
```
String:   Name, code, description, category, image
Decimal:  price1, price2, price3, price4, price5, price6
Integer:  Stock Quality
```

#### 5. Validación de Unicidad
- **code:** Debe ser único en todo el sistema
  - Si el código ya existe, preguntar al usuario:
    - ¿Actualizar producto existente?
    - ¿Omitir esta fila?

#### 6. Validación de Precios
- `price1` es obligatorio
- `price2` a `price6` son opcionales
- Todos los precios deben ser >= 0
- Formato: números con hasta 2 decimales (ejemplo: 36.84)

#### 7. Validación de Imagen
- Campo `image` debe contener una URL válida
- Formatos soportados: JPG, JPEG, PNG, WEBP
- El sistema debe:
  - Descargar la imagen desde la URL
  - Validar que sea una imagen válida
  - Almacenarla en el storage propio (S3)
  - Generar URL nueva interna

#### 8. Validación de Stock
- Debe ser número entero
- Debe ser >= 0
- No se permiten valores negativos

---

## Comportamiento del Importador

### Flujo de Importación

```
1. Usuario sube archivo CSV
   ↓
2. Sistema valida extensión (.csv)
   ↓
3. Sistema valida estructura (12 columnas, nombres correctos)
   ↓
4. Sistema lee todas las filas
   ↓
5. Para cada fila:
   ├─ Validar campos obligatorios presentes
   ├─ Validar tipos de datos
   ├─ Validar código único
   ├─ Validar URL de imagen accesible
   └─ Marcar fila como válida/inválida
   ↓
6. Generar reporte de validación:
   ├─ Filas válidas: X
   ├─ Filas con errores: Y
   └─ Detalles de errores por fila
   ↓
7. Mostrar reporte al usuario
   ↓
8. Usuario decide:
   ├─ Cancelar y corregir archivo
   └─ Continuar con filas válidas
   ↓
9. Si continúa:
   ├─ Importar filas válidas
   ├─ Descargar y almacenar imágenes
   └─ Crear/actualizar productos en BD
   ↓
10. Mostrar resumen final:
    ├─ Productos importados: X
    ├─ Productos actualizados: Y
    └─ Productos omitidos: Z
```

---

## Tipos de Errores Posibles

### Errores Críticos (Detienen importación completa)
| Error | Descripción | Solución |
|-------|-------------|----------|
| **Archivo no CSV** | Extensión incorrecta | Convertir a .csv |
| **Estructura incorrecta** | No tiene 12 columnas | Revisar encabezado |
| **Nombres de columnas erróneos** | No coinciden exactamente | Corregir nombres |
| **Codificación incorrecta** | Caracteres extraños | Guardar como UTF-8 |

### Errores por Fila (Se pueden omitir filas problemáticas)
| Error | Descripción | Acción del Sistema |
|-------|-------------|-------------------|
| **Campo obligatorio vacío** | Name, code, description, category, price1, image o Stock Quality vacío | Marcar fila como inválida |
| **Código duplicado** | Ya existe en la base de datos | Preguntar al usuario |
| **Precio inválido** | No es número o es negativo | Marcar fila como inválida |
| **Stock inválido** | No es entero o es negativo | Marcar fila como inválida |
| **URL imagen inaccesible** | 404, timeout, formato inválido | Marcar fila como advertencia |

---

## Ejemplo de Reporte de Validación

### Reporte Exitoso
```
 VALIDACIÓN EXITOSA

Archivo: catalogo_aljaba_feb_2026.csv
Total de filas: 4,000

 Estructura correcta
 Todas las columnas presentes
 3,998 filas válidas (99.95%)
⚠️  2 filas con advertencias

Detalles de advertencias:
- Fila 1234: URL de imagen devuelve 404 (se usará imagen placeholder)
- Fila 3456: Precio2 vacío (se omitirá este precio)

¿Desea continuar con la importación?
[Sí, importar] [No, cancelar]
```

### Reporte con Errores
```
 ERRORES DE VALIDACIÓN

Archivo: catalogo_aljaba_feb_2026.csv
Total de filas: 4,000

 Estructura correcta
 150 filas con errores críticos (3.75%)
⚠️  45 filas con advertencias (1.13%)

Errores críticos:
- Fila 23: Campo "code" vacío
- Fila 45: Campo "price1" vacío
- Fila 67: Campo "code" duplicado (ya existe GE-75003WM)
- ... (ver lista completa)

Advertencias:
- Fila 100: URL de imagen inaccesible
- Fila 200: Precio3 no es número válido ("N/A")
- ... (ver lista completa)

Opciones:
[Descargar reporte de errores] [Cancelar] [Importar solo filas válidas]
```

---

## Manejo de Categorías

### Categorías en el CSV
- El campo `category` es un string simple
- Puede contener categorías con subcategorías separadas por `/` o `>`:
  - Ejemplo: "Iluminación/Interior/Bombillas LED"
  - Ejemplo: "Iluminación > Exterior > Reflectores"

### Comportamiento del Sistema
1. **Categoría no existe:**
   - El sistema la crea automáticamente
   - Si tiene subcategorías, crea todo el árbol jerárquico

2. **Categoría existe:**
   - Asigna el producto a esa categoría existente

3. **Ejemplo:**
   ```
   CSV Input:  "Iluminación/Interior/Bombillas LED"
   
   Sistema crea:
   - Iluminación (categoría padre)
     └── Interior (subcategoría)
         └── Bombillas LED (subcategoría hija)
   ```

---

## Manejo de Imágenes

### Imágenes desde URL Externa (Postimages)
1. Sistema descarga la imagen desde la URL del CSV
2. Valida que sea una imagen válida
3. Almacena en storage propio (S3/Spaces)
4. Genera nueva URL interna
5. Reemplaza URL externa por URL interna en la base de datos

### ¿Por qué descargar y almacenar?
- **Control:** No depender de servicios externos (Postimages puede fallar)
- **Velocidad:** CDN propio más rápido
- **Seguridad:** URLs firmadas, control de acceso
- **Backup:** Imágenes incluidas en backups automáticos

---

## Formato de Descarga de CSV

### Exportar Productos a CSV
El sistema también debe permitir exportar productos a CSV con el mismo formato:

```csv
Name,code,description,category,price1,price2,price3,price4,price5,price6,image,Stock Quality
Producto1,ABC-001,Descripción 1,Categoría A,10.50,9.80,9.50,9.20,9.00,8.80,https://cdn.aljaba.com/img1.jpg,150
Producto2,ABC-002,Descripción 2,Categoría B,20.00,,,,,,,100
```

**Notas:**
- Campos vacíos se dejan sin valor (comas consecutivas)
- URLs de imágenes serán las URLs internas del sistema

---

## Validación de Ejemplo en Pseudocódigo

```javascript
function validateCSVRow(row, rowNumber) {
  const errors = [];
  const warnings = [];
  
  // Validar campos obligatorios
  if (!row.Name) errors.push(`Fila ${rowNumber}: Name vacío`);
  if (!row.code) errors.push(`Fila ${rowNumber}: code vacío`);
  if (!row.description) errors.push(`Fila ${rowNumber}: description vacío`);
  if (!row.category) errors.push(`Fila ${rowNumber}: category vacío`);
  if (!row.image) errors.push(`Fila ${rowNumber}: image vacío`);
  
  // Validar price1 obligatorio
  if (!row.price1) {
    errors.push(`Fila ${rowNumber}: price1 vacío`);
  } else if (isNaN(row.price1) || row.price1 < 0) {
    errors.push(`Fila ${rowNumber}: price1 debe ser número positivo`);
  }
  
  // Validar Stock Quality
  if (!row['Stock Quality']) {
    errors.push(`Fila ${rowNumber}: Stock Quality vacío`);
  } else if (!Number.isInteger(row['Stock Quality']) || row['Stock Quality'] < 0) {
    errors.push(`Fila ${rowNumber}: Stock Quality debe ser entero >= 0`);
  }
  
  // Validar precios opcionales
  for (let i = 2; i <= 6; i++) {
    const priceField = `price${i}`;
    if (row[priceField] && (isNaN(row[priceField]) || row[priceField] < 0)) {
      warnings.push(`Fila ${rowNumber}: ${priceField} no es número válido`);
    }
  }
  
  // Validar código único
  if (codeExistsInDatabase(row.code)) {
    warnings.push(`Fila ${rowNumber}: código ${row.code} ya existe`);
  }
  
  // Validar URL de imagen
  if (row.image && !isValidURL(row.image)) {
    errors.push(`Fila ${rowNumber}: URL de imagen inválida`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
```

---

## Testing del Importador

### Casos de Prueba Mínimos

| # | Caso de Prueba | Resultado Esperado |
|---|----------------|-------------------|
| 1 | CSV con estructura correcta y datos válidos |  Importación exitosa 100% |
| 2 | CSV sin encabezado |  Error crítico |
| 3 | CSV con 11 columnas (falta una) |  Error crítico |
| 4 | CSV con columna extra | ⚠️ Advertencia, columna ignorada |
| 5 | Fila con código duplicado | ⚠️ Advertencia, preguntar al usuario |
| 6 | Fila con price1 vacío |  Fila inválida |
| 7 | Fila con price2-6 vacíos |  Fila válida (precios opcionales) |
| 8 | Fila con URL imagen 404 | ⚠️ Advertencia, usar imagen placeholder |
| 9 | CSV con 4,000 filas válidas |  Importación completa < 30 segundos |
| 10 | CSV con caracteres especiales (ñ, á, é) |  Importación correcta (UTF-8) |

---

## Resumen de Implementación

### Prioridad de Desarrollo

**Fase 1: Validación Básica**
-  Validar estructura (12 columnas)
-  Validar campos obligatorios presentes
-  Validar tipos de datos

**Fase 2: Validación Avanzada**
-  Validar unicidad de código
-  Validar URLs de imágenes
-  Generar reporte detallado

**Fase 3: Importación**
-  Importar productos válidos
-  Descargar y almacenar imágenes
-  Crear categorías automáticamente
-  Manejo de duplicados

**Fase 4: UX**
-  Reporte visual de errores
-  Opción de descargar reporte
-  Barra de progreso durante importación
-  Resumen post-importación

---

**Documento de Referencia Técnica**  
**Última actualización:** 14 de febrero de 2026  
**Versión:** 1.0
