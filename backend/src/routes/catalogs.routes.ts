import { Router } from 'express'
import { catalogsController } from '../controllers/catalogs.controller'
import { requireAuth, requireAdmin } from '../middleware/auth.middleware'

const router = Router()

// List & create — admin only (guests use /guest)
router.get('/',  requireAuth, requireAdmin, catalogsController.list)
router.post('/', requireAuth, requireAdmin, catalogsController.create)

// Guest authenticated view — only guestVisible catalogs (before /:id to avoid conflict)
router.get('/guest', requireAuth, catalogsController.listForGuest)

// Public view — no auth required (before /:id to avoid conflicts)
router.get('/public/:slug', catalogsController.getPublic)

// CRUD by ID
router.get('/:id',    requireAuth, requireAdmin, catalogsController.getById)
router.put('/:id',    requireAuth, requireAdmin, catalogsController.update)
router.delete('/:id', requireAuth, requireAdmin, catalogsController.delete)

// Publish / Unpublish
router.put('/:id/publish',   requireAuth, requireAdmin, catalogsController.publish)
router.put('/:id/unpublish', requireAuth, requireAdmin, catalogsController.unpublish)

// Products sub-resource
router.post('/:id/products',                          requireAuth, requireAdmin, catalogsController.addProducts)
router.delete('/:id/products/:productId',             requireAuth, requireAdmin, catalogsController.removeProduct)
router.put('/:id/products/reorder',                   requireAuth, requireAdmin, catalogsController.reorderProducts)
router.put('/:id/products/:productId/image',          requireAuth, requireAdmin, catalogsController.setProductImageOverride)

export default router
