import type { Request, Response } from 'express'
import multer from 'multer'
import { imagesService } from '../services/images.service'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 100 },
})

export const imagesUploadMiddleware = upload.array('files', 100)
export const imageEditMiddleware = upload.single('file')

export const imagesController = {
  async list(req: Request, res: Response) {
    try {
      const result = await imagesService.list(req.query)
      res.json(result)
    } catch (error) {
      res.status(400).json({ message: String((error as Error).message) })
    }
  },

  async upload(req: Request, res: Response) {
    const files = (req as Request & { files?: Express.Multer.File[] }).files ?? []
    if (files.length === 0) {
      res.status(400).json({ message: 'No se recibieron archivos' })
      return
    }

    try {
      const result = await imagesService.uploadMany(files)
      res.status(201).json({ uploaded: result })
    } catch (error) {
      res.status(400).json({ message: String((error as Error).message) })
    }
  },

  async overwrite(req: Request, res: Response) {
    const file = (req as Request & { file?: Express.Multer.File }).file
    if (!file) {
      res.status(400).json({ message: 'No se recibió archivo editado' })
      return
    }

    try {
      const image = await imagesService.overwrite(req.params.id, file)
      res.json({
        ...image,
        linkedProducts: image.products,
        usageCount: image.products.length,
      })
    } catch (error) {
      const message = (error as Error).message || 'No se pudo sobrescribir la imagen'
      res.status(400).json({ message })
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const result = await imagesService.delete(req.params.id)
      res.json({ message: 'Imagen eliminada', ...result })
    } catch (error) {
      const message = (error as Error).message || 'No se pudo eliminar la imagen'
      res.status(400).json({ message })
    }
  },
}