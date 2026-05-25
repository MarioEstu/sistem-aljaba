import { parse } from 'csv-parse/sync'
import { prisma } from '../config/database'
import { categoriesService } from './categories.service'

// Columnas esperadas (case-insensitive)
const REQUIRED_COLS = ['name', 'code', 'description', 'category', 'price1', 'stock quality']
const ALL_COLS      = [...REQUIRED_COLS, 'price2', 'price3', 'price4', 'price5', 'price6']

export interface CsvRow {
  line:        number
  name:        string
  code:        string
  description: string
  category:    string
  price1:      number | null
  price2:      number | null
  price3:      number | null
  price4:      number | null
  price5:      number | null
  price6:      number | null
  stock:       number | null
}

export interface CsvRowResult extends CsvRow {
  status:      'ok' | 'error' | 'warning' | 'duplicate'
  errors:      string[]
  warnings:    string[]
  imageFound:  boolean
  existsInDb:  boolean   // code ya existe en DB
}

export interface CsvPreviewResult {
  rows:         CsvRowResult[]
  totalRows:    number
  okCount:      number
  errorCount:   number
  warningCount: number
  dupCount:     number
}

function parsePrice(val: string): number | null {
  if (!val || val.trim() === '') return null
  const n = parseFloat(val.replace(',', '.'))
  return isNaN(n) ? null : n
}

function parseStock(val: string): number | null {
  if (!val || val.trim() === '') return null
  const n = parseInt(val, 10)
  return isNaN(n) ? null : n
}

// Normaliza cabeceras a minúsculas sin espacios extra
function normalizeHeader(h: string): string {
  return h.toLowerCase().trim()
}

/** Detecta automáticamente el delimitador leyendo la primera línea del buffer */
function detectDelimiter(buffer: Buffer): string {
  const firstLine = buffer.toString('utf8').split('\n')[0] ?? ''
  const commas    = (firstLine.match(/,/g)  ?? []).length
  const semis     = (firstLine.match(/;/g)  ?? []).length
  return semis > commas ? ';' : ','
}

export async function parseCsvPreview(buffer: Buffer): Promise<CsvPreviewResult> {
  // 1. Parsear CSV (soporta , y ; como separador)
  const delimiter = detectDelimiter(buffer)
  let records: Record<string, string>[]
  try {
    records = parse(buffer, {
      columns:            (headers: string[]) => headers.map(normalizeHeader),
      skip_empty_lines:   true,
      trim:               true,
      relax_column_count: true,
      delimiter,
      bom:                true,   // eliminar BOM UTF-8 si está presente
    }) as Record<string, string>[]
  } catch {
    throw new Error('El archivo no es un CSV válido o tiene formato incorrecto')
  }

  if (records.length === 0) throw new Error('El archivo CSV está vacío')

  // 2. Verificar columnas requeridas
  const headers = Object.keys(records[0])
  const missingCols = REQUIRED_COLS.filter((c) => !headers.includes(c))
  if (missingCols.length > 0) {
    throw new Error(`Columnas faltantes en el CSV: ${missingCols.join(', ')}`)
  }

  // 3. Obtener imágenes y productos existentes para comparar
  const [images, existingProducts] = await Promise.all([
    prisma.image.findMany({ select: { id: true, filename: true } }),
    prisma.product.findMany({ select: { code: true } }),
  ])

  // Mapas para búsqueda rápida
  const imageMap = new Map(
    images.map((img) => [img.filename.replace(/\.[^.]+$/, '').toLowerCase(), img.id]),
  )
  const existingCodes = new Set(existingProducts.map((p) => p.code.toLowerCase()))

  // 4. Procesar filas
  const rows: CsvRowResult[] = []
  const seenCodes = new Set<string>()

  for (let i = 0; i < records.length; i++) {
    const r = records[i]
    const lineNum = i + 2 // +2: encabezado es línea 1
    const errors: string[] = []
    const warnings: string[] = []

    const name        = (r['name']          || '').trim()
    const code        = (r['code']           || '').trim()
    const description = (r['description']    || '').trim()
    const category    = (r['category']       || '').trim()
    const price1      = parsePrice(r['price1']     || '')
    const price2      = parsePrice(r['price2']     || '')
    const price3      = parsePrice(r['price3']     || '')
    const price4      = parsePrice(r['price4']     || '')
    const price5      = parsePrice(r['price5']     || '')
    const price6      = parsePrice(r['price6']     || '')
    const stock       = parseStock(r['stock quality'] || '')

    // Validaciones
    if (!name)        errors.push('Nombre vacío')
    if (!code)        errors.push('Código vacío')
    if (!description) warnings.push('Sin descripción')
    if (!category)    warnings.push('Sin categoría')
    if (price1 === null) errors.push('price1 inválido o vacío')

    // Código duplicado dentro del mismo CSV
    let status: CsvRowResult['status'] = 'ok'
    if (code && seenCodes.has(code.toLowerCase())) {
      errors.push(`Código duplicado en el CSV: "${code}"`)
      status = 'error'
    }
    if (code) seenCodes.add(code.toLowerCase())

    const existsInDb = code ? existingCodes.has(code.toLowerCase()) : false
    if (existsInDb && status !== 'error') {
      status = 'duplicate'
      warnings.push('Este código ya existe en la base de datos (se sobreescribirá)')
    }

    const imageFound = code
      ? imageMap.has(code.toLowerCase())
      : false
    if (!imageFound && code) {
      warnings.push(`Sin imagen vinculada para el código "${code}"`)
    }

    // Prioridad: error > duplicate > warning > ok
    if (errors.length > 0)       status = 'error'
    else if (existsInDb)         status = 'duplicate'
    else if (warnings.length > 0) status = 'warning'

    rows.push({
      line: lineNum, name, code, description, category,
      price1, price2, price3, price4, price5, price6, stock,
      status, errors, warnings, imageFound, existsInDb,
    })
  }

  const okCount      = rows.filter((r) => r.status === 'ok').length
  const warningCount = rows.filter((r) => r.status === 'warning').length
  const dupCount     = rows.filter((r) => r.status === 'duplicate').length
  const errorCount   = rows.filter((r) => r.status === 'error').length

  return { rows, totalRows: rows.length, okCount, errorCount, warningCount, dupCount }
}

export async function importCsvRows(
  rows: CsvRowResult[],
  overwriteDuplicates: boolean,
): Promise<{ imported: number; skipped: number; errors: number }> {
  let imported = 0, skipped = 0, errors = 0

  // Obtener mapa de imágenes y códigos existentes
  const [images, existing] = await Promise.all([
    prisma.image.findMany({ select: { id: true, filename: true } }),
    prisma.product.findMany({ select: { id: true, code: true } }),
  ])
  const imageMap   = new Map(images.map((img) => [img.filename.replace(/\.[^.]+$/, '').toLowerCase(), img.id]))
  const codeToId   = new Map(existing.map((p) => [p.code.toLowerCase(), p.id]))

  for (const row of rows) {
    if (row.status === 'error') { errors++; continue }
    if (row.status === 'duplicate' && !overwriteDuplicates) { skipped++; continue }

    try {
      const categoryId = row.category
        ? await categoriesService.upsertByName(row.category)
        : null

      const imageId = row.code
        ? (imageMap.get(row.code.toLowerCase()) ?? null)
        : null

      const data = {
        name:        row.name,
        code:        row.code,
        description: row.description || null,
        categoryId,
        price1:      row.price1,
        price2:      row.price2,
        price3:      row.price3,
        price4:      row.price4,
        price5:      row.price5,
        price6:      row.price6,
        stock:       row.stock,
        imageId,
      }

      if (row.existsInDb && overwriteDuplicates) {
        const existingId = codeToId.get(row.code.toLowerCase())!
        await prisma.product.update({ where: { id: existingId }, data })
      } else {
        await prisma.product.create({ data })
      }
      imported++
    } catch {
      errors++
    }
  }

  return { imported, skipped, errors }
}
