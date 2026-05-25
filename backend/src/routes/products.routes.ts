import { Router } from 'express'
import { productsController, csvUploadMiddleware } from '../controllers/products.controller'
import { requireAuth, requireAdmin } from '../middleware/auth.middleware'

const router = Router()

// CSV — antes del /:id para no colisionar
router.post('/csv/preview', requireAuth, requireAdmin, csvUploadMiddleware, productsController.csvPreview)
router.post('/csv/import',  requireAuth, requireAdmin, productsController.csvImport)

// Bulk action
router.post('/bulk', requireAuth, requireAdmin, productsController.bulkAction)

// CRUD
router.get('/',     requireAuth, productsController.list)
router.post('/',    requireAuth, requireAdmin, productsController.create)
router.get('/:id',  requireAuth, productsController.getById)
router.put('/:id',  requireAuth, requireAdmin, productsController.update)
router.delete('/:id', requireAuth, requireAdmin, productsController.delete)

export default router
