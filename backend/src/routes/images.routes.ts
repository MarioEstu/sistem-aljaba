import { Router } from 'express'
import { requireAdmin, requireAuth } from '../middleware/auth.middleware'
import {
  imageEditMiddleware,
  imagesController,
  imagesUploadMiddleware,
} from '../controllers/images.controller'

const router = Router()

router.get('/', requireAuth, imagesController.list)
router.post('/upload', requireAuth, requireAdmin, imagesUploadMiddleware, imagesController.upload)
router.put('/:id/edit', requireAuth, requireAdmin, imageEditMiddleware, imagesController.overwrite)
router.delete('/:id', requireAuth, requireAdmin, imagesController.delete)

export default router