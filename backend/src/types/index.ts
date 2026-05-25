export type Role = 'admin' | 'guest'

export interface AuthTokenPayload {
  sub: string
  username: string
  role: Role
  iat?: number
  exp?: number
}

// Express request augmentado
import type { Request } from 'express'
export interface AuthRequest extends Request {
  user?: AuthTokenPayload
}
