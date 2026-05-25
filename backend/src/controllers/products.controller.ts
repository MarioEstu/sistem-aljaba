import type { Request, Response } from 'express'
import { z } from 'zod'
import {
  productsService,
  productCreateSchema,
  productUpdateSchema,
  bulkActionSchema,
} from '../services/products.service'
import { parseCsvPreview, importCsvRows } from '../services/csv-import.service'
import type { CsvRowResult } from '../services/csv-import.service'
import multer from 'multer'

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })
export const csvUploadMiddleware = upload.single('file')

export const productsController = {
  async list(req: Request, res: Response) {
    try {
      const result = await productsService.list(req.query)
      res.json(result)
    } catch {
      res.status(400).json({ message: 'Parámetros inválidos' })
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const product = await productsService.getById(req.params.id)
      res.json(product)
    } catch {
      res.status(404).json({ message: 'Producto no encontrado' })
    }
  },

  async create(req: Request, res: Response) {
    try {
      const data = productCreateSchema.parse(req.body)
      const product = await productsService.create(data)
      res.status(201).json(product)
    } catch (err: unknown) {
      const msg = (err as { code?: string })?.code === 'P2002'
        ? 'El código ya existe en el sistema'
        : 'Datos inválidos'
      res.status(400).json({ message: msg })
    }
  },

  async update(req: Request, res: Response) {
    try {
      const data = productUpdateSchema.parse(req.body)
      const product = await productsService.update(req.params.id, data)
      res.json(product)
    } catch (err: unknown) {
      const msg = (err as { code?: string })?.code === 'P2002'
        ? 'El código ya existe en el sistema'
        : 'No se pudo actualizar el producto'
      res.status(400).json({ message: msg })
    }
  },

  async delete(req: Request, res: Response) {
    try {
      await productsService.delete(req.params.id)
      res.json({ message: 'Producto eliminado' })
    } catch {
      res.status(400).json({ message: 'No se pudo eliminar el producto' })
    }
  },

  async bulkAction(req: Request, res: Response) {
    try {
      const result = await productsService.bulkAction(req.body)
      res.json({ message: 'Operación masiva completada', result })
    } catch (err) {
      res.status(400).json({ message: 'Error en operación masiva', detail: String(err) })
    }
  },

  // POST /api/products/csv/preview — recibe archivo, devuelve reporte sin guardar
  async csvPreview(req: Request, res: Response) {
    const file = (req as Request & { file?: Express.Multer.File }).file
    if (!file) {
      res.status(400).json({ message: 'No se recibió ningún archivo' })
      return
    }
    try {
      const result = await parseCsvPreview(file.buffer)
      res.json(result)
    } catch (err: unknown) {
      res.status(400).json({ message: String((err as Error).message) })
    }
  },

  // POST /api/products/csv/import — recibe rows del preview + opción overwrite
  async csvImport(req: Request, res: Response) {
    const { rows, overwriteDuplicates } = req.body as {
      rows: CsvRowResult[]
      overwriteDuplicates: boolean
    }
    if (!Array.isArray(rows)) {
      res.status(400).json({ message: 'rows inválido' })
      return
    }

    // Revalidar que solo se importan filas seguras — el backend no confía en el 'status' del cliente
    // Se re-ejecuta parseCsvPreview implícitamente: los campos ya llegan, pero verificamos
    // que las filas tengan los campos mínimos requeridos antes de pasarlas al servicio.
    const rowSchema = z.object({
      name:       z.string().min(1),
      code:       z.string().min(1),
      price1:     z.number().positive().nullable(),
      category:   z.string(),
      description:z.string(),
      price2: z.number().nullable(), price3: z.number().nullable(),
      price4: z.number().nullable(), price5: z.number().nullable(),
      price6: z.number().nullable(), stock:  z.number().int().nullable(),
      existsInDb: z.boolean(),
      imageFound: z.boolean(),
      line:       z.number(),
      errors:     z.array(z.string()),
      warnings:   z.array(z.string()),
      status:     z.enum(['ok', 'warning', 'duplicate', 'error']),
    })

    const parsed = rows
      .map((r) => rowSchema.safeParse(r))
      .filter((r) => r.success)
      .map((r) => (r as { success: true; data: CsvRowResult }).data)

    // Rechazar filas que tengan errores de validación de negocio, sin importar el status del cliente
    const safe = parsed.filter(
      (r) => r.name && r.code && r.price1 != null && r.errors.length === 0,
    )

    if (safe.length === 0) {
      res.status(400).json({ message: 'Sin filas válidas para importar' })
      return
    }

    try {
      const result = await importCsvRows(safe, !!overwriteDuplicates)
      res.json(result)
    } catch (err) {
      res.status(500).json({ message: 'Error durante importación', detail: String(err) })
    }
  },
}
