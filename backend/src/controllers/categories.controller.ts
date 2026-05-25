import type { Request, Response } from 'express'
import { categoriesService } from '../services/categories.service'
import { z } from 'zod'

const createSchema = z.object({
  name: z.string().min(1).max(100),
  parentId: z.string().uuid().optional(),
})
const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  parentId: z.string().uuid().nullable().optional(),
})

export const categoriesController = {
  async tree(_req: Request, res: Response) {
    const data = await categoriesService.getTree()
    res.json(data)
  },

  async flat(_req: Request, res: Response) {
    const data = await categoriesService.getFlat()
    res.json(data)
  },

  async create(req: Request, res: Response) {
    try {
      const data = createSchema.parse(req.body)
      const cat = await categoriesService.create(data)
      res.status(201).json(cat)
    } catch (err) {
      res.status(400).json({ message: 'Datos inválidos', detail: String(err) })
    }
  },

  async update(req: Request, res: Response) {
    try {
      const data = updateSchema.parse(req.body)
      const cat = await categoriesService.update(req.params.id, data)
      res.json(cat)
    } catch {
      res.status(400).json({ message: 'No se pudo actualizar la categoría' })
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { reassignTo } = req.query as { reassignTo?: string }
      await categoriesService.delete(req.params.id, reassignTo)
      res.json({ message: 'Categoría eliminada' })
    } catch {
      res.status(400).json({ message: 'No se pudo eliminar la categoría' })
    }
  },
}
