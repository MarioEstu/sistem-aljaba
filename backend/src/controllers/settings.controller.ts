import type { Request, Response } from 'express'
import { ZodError } from 'zod'
import { settingsService } from '../services/settings.service'
import type { AuthRequest } from '../types'

function selfId(req: Request): string {
  return (req as AuthRequest).user!.sub
}

export const settingsController = {
  async getProfile(req: Request, res: Response) {
    try {
      res.json(await settingsService.getProfile(selfId(req)))
    } catch {
      res.status(500).json({ message: 'Error al obtener perfil' })
    }
  },

  async updateProfile(req: Request, res: Response) {
    try {
      const user = await settingsService.updateProfile(selfId(req), req.body)
      res.json(user)
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ message: 'Datos inválidos', errors: err.errors })
        return
      }
      res.status(400).json({ message: (err as Error).message })
    }
  },

  async changePassword(req: Request, res: Response) {
    try {
      await settingsService.changeOwnPassword(selfId(req), req.body)
      res.json({ ok: true })
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ message: 'Datos inválidos', errors: err.errors })
        return
      }
      res.status(400).json({ message: (err as Error).message })
    }
  },
}
