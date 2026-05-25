import type { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../config/jwt'
import type { AuthRequest } from '../types'

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token requerido' })
    return
  }

  const token = authHeader.slice(7)
  try {
    const payload = verifyToken(token)
    ;(req as AuthRequest).user = payload
    next()
  } catch {
    res.status(401).json({ message: 'Token inválido o expirado' })
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const user = (req as AuthRequest).user
  if (!user || user.role !== 'admin') {
    res.status(403).json({ message: 'Acceso denegado' })
    return
  }
  next()
}
