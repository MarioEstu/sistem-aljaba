import type { Request, Response } from 'express'
import { authService } from '../services/auth.service'
import type { AuthRequest } from '../types'

export const authController = {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.login(req.body)
      res.json(result)
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'INVALID_CREDENTIALS') {
        res.status(401).json({ message: 'Usuario o contraseña incorrectos' })
        return
      }
      console.error('[auth] login error:', err)
      res.status(400).json({ message: 'Datos inválidos' })
    }
  },

  async me(req: Request, res: Response): Promise<void> {
    const user = (req as AuthRequest).user!
    try {
      const profile = await authService.me(user.sub)
      res.json(profile)
    } catch {
      res.status(404).json({ message: 'Usuario no encontrado' })
    }
  },
}
