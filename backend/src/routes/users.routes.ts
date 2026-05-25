import { Router } from 'express'
import { requireAdmin, requireAuth } from '../middleware/auth.middleware'
import { usersController } from '../controllers/users.controller'

const router = Router()

// All user management requires admin
router.get   ('/',                  requireAuth, requireAdmin, usersController.list)
router.post  ('/',                  requireAuth, requireAdmin, usersController.create)
router.get   ('/:id',               requireAuth, requireAdmin, usersController.getById)
router.put   ('/:id',               requireAuth, requireAdmin, usersController.update)
router.patch ('/:id/password',      requireAuth, requireAdmin, usersController.changePassword)
router.patch ('/:id/toggle-active', requireAuth, requireAdmin, usersController.toggleActive)
router.delete('/:id',               requireAuth, requireAdmin, usersController.delete)

export default router
