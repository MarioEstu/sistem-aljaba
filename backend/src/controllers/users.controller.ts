import type { Request, Response } from 'express'
import { ZodError } from 'zod'
import { usersService } from '../services/users.service'
import type { AuthRequest } from '../types'

function requesterId(req: Request): string {
  return (req as AuthRequest).user!.sub
}

export const usersController = {
  async list(_req: Request, res: Response) {
    try {
      res.json(await usersService.list())
    } catch (err) {
      res.status(500).json({ message: (err as Error).message })
    }
  },

  async getById(req: Request, res: Response) {
    try {
      res.json(await usersService.getById(req.params.id))
    } catch {
      res.status(404).json({ message: 'Usuario no encontrado' })
    }
  },

  async create(req: Request, res: Response) {
    try {
      const user = await usersService.create(req.body)
      res.status(201).json(user)
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ message: 'Datos inválidos', errors: err.errors })
        return
      }
      res.status(400).json({ message: (err as Error).message })
    }
  },

  async update(req: Request, res: Response) {
    try {
      const user = await usersService.update(req.params.id, req.body, requesterId(req))
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
      await usersService.changePassword(req.params.id, req.body)
      res.json({ ok: true })
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ message: 'Datos inválidos', errors: err.errors })
        return
      }
      res.status(400).json({ message: (err as Error).message })
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const result = await usersService.delete(req.params.id, requesterId(req))
      res.json(result)
    } catch (err) {
      res.status(400).json({ message: (err as Error).message })
    }
  },

  async toggleActive(req: Request, res: Response) {
    try {
      const user = await usersService.toggleActive(req.params.id, requesterId(req))
      res.json(user)
    } catch (err) {
      res.status(400).json({ message: (err as Error).message })
    }
  },
}
