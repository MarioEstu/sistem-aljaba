import { Router } from 'express'
import { authController } from '../controllers/auth.controller'
import { requireAuth } from '../middleware/auth.middleware'

const router = Router()

// POST /api/auth/login
router.post('/login', authController.login)

// GET /api/auth/me  (requiere token)
router.get('/me', requireAuth, authController.me)

export default router
