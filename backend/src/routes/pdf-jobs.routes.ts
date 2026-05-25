import { Router } from 'express'
import { requireAdmin, requireAuth } from '../middleware/auth.middleware'
import { pdfJobsController } from '../controllers/pdf-jobs.controller'

const router = Router()

// List all jobs (admin) or filtered by catalogId
router.get ('/',         requireAuth,  requireAdmin, pdfJobsController.list)
// Create a new PDF job
router.post('/',         requireAuth,  requireAdmin, pdfJobsController.create)
// Get single job status (auth only — guests can poll their own requested jobs)
router.get ('/:id',      requireAuth,  pdfJobsController.getById)
// Delete a job record + file
router.delete('/:id',   requireAuth,  requireAdmin, pdfJobsController.delete)
// Retry a failed job
router.post ('/:id/retry', requireAuth, requireAdmin, pdfJobsController.retry)

export default router
