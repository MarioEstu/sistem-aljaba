import type { Request, Response } from 'express'
import { z } from 'zod'
import { pdfJobsService } from '../services/pdf-jobs.service'
import type { AuthRequest } from '../types'

const createSchema = z.object({
  catalogId: z.string().uuid('catalogId debe ser un UUID válido'),
})

export const pdfJobsController = {
  async create(req: Request, res: Response) {
    try {
      const { catalogId } = createSchema.parse(req.body)
      const userId = (req as AuthRequest).user!.sub
      const job = await pdfJobsService.create(catalogId, userId)
      res.status(202).json(job)
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: 'Datos inválidos', errors: err.errors })
        return
      }
      const msg = (err as Error).message || 'Error al crear el trabajo PDF'
      res.status(400).json({ message: msg })
    }
  },

  async list(req: Request, res: Response) {
    try {
      const catalogId = typeof req.query.catalogId === 'string' ? req.query.catalogId : undefined
      const jobs = await pdfJobsService.list(catalogId)
      res.json(jobs)
    } catch (err) {
      res.status(500).json({ message: (err as Error).message })
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const job = await pdfJobsService.getById(req.params.id)
      res.json(job)
    } catch {
      res.status(404).json({ message: 'Trabajo PDF no encontrado' })
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const result = await pdfJobsService.delete(req.params.id)
      res.json(result)
    } catch (err) {
      res.status(404).json({ message: (err as Error).message })
    }
  },

  async retry(req: Request, res: Response) {
    try {
      const job = await pdfJobsService.retry(req.params.id)
      res.status(202).json(job)
    } catch (err) {
      res.status(400).json({ message: (err as Error).message })
    }
  },
}
