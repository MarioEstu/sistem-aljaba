import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { settingsController } from '../controllers/settings.controller'

const router = Router()

// Any authenticated user can manage their own profile
router.get   ('/me',          requireAuth, settingsController.getProfile)
router.put   ('/me',          requireAuth, settingsController.updateProfile)
router.patch ('/me/password', requireAuth, settingsController.changePassword)

export default router
