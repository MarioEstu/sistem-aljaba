import { Router } from 'express'
import { categoriesController } from '../controllers/categories.controller'
import { requireAuth, requireAdmin } from '../middleware/auth.middleware'

const router = Router()

router.get('/',       requireAuth, categoriesController.tree)
router.get('/flat',   requireAuth, categoriesController.flat)
router.post('/',      requireAuth, requireAdmin, categoriesController.create)
router.put('/:id',    requireAuth, requireAdmin, categoriesController.update)
router.delete('/:id', requireAuth, requireAdmin, categoriesController.delete)

export default router
