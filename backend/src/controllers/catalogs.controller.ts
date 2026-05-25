import type { Request, Response } from 'express'
import { ZodError } from 'zod'
import {
  catalogsService,
  catalogCreateSchema,
  catalogUpdateSchema,
  addProductsSchema,
  reorderSchema,
  imageOverrideSchema,
} from '../services/catalogs.service'
import type { AuthRequest } from '../types'

const notFound = (res: Response) => res.status(404).json({ message: 'Catálogo no encontrado' })
const isNotFound = (err: unknown) => (err as Error).message === 'NOT_FOUND'

export const catalogsController = {
  async list(_req: Request, res: Response) {
    try {
      res.json(await catalogsService.list())
    } catch {
      res.status(500).json({ message: 'Error al listar catálogos' })
    }
  },

  async listForGuest(_req: Request, res: Response) {
    try {
      res.json(await catalogsService.listForGuest())
    } catch {
      res.status(500).json({ message: 'Error al listar catálogos' })
    }
  },

  async getById(req: Request, res: Response) {
    try {
      res.json(await catalogsService.getById(req.params.id))
    } catch (err) {
      isNotFound(err) ? notFound(res) : res.status(500).json({ message: 'Error interno' })
    }
  },

  async getPublic(req: Request, res: Response) {
    try {
      res.json(await catalogsService.getPublic(req.params.slug))
    } catch {
      res.status(404).json({ message: 'Catálogo no encontrado o no publicado' })
    }
  },

  async create(req: Request, res: Response) {
    try {
      const data   = catalogCreateSchema.parse(req.body)
      const userId = (req as AuthRequest).user!.sub
      res.status(201).json(await catalogsService.create(data, userId))
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ message: 'Datos inválidos', errors: err.errors })
      } else {
        res.status(400).json({ message: 'Error al crear el catálogo' })
      }
    }
  },

  async update(req: Request, res: Response) {
    try {
      const data = catalogUpdateSchema.parse(req.body)
      res.json(await catalogsService.update(req.params.id, data))
    } catch (err) {
      if (isNotFound(err)) return notFound(res)
      if (err instanceof ZodError) return res.status(400).json({ message: 'Datos inválidos' })
      res.status(400).json({ message: 'Error al actualizar el catálogo' })
    }
  },

  async delete(req: Request, res: Response) {
    try {
      await catalogsService.delete(req.params.id)
      res.json({ message: 'Catálogo eliminado' })
    } catch (err) {
      isNotFound(err) ? notFound(res) : res.status(400).json({ message: 'Error al eliminar' })
    }
  },

  async addProducts(req: Request, res: Response) {
    try {
      const { productIds } = addProductsSchema.parse(req.body)
      res.json(await catalogsService.addProducts(req.params.id, productIds))
    } catch (err) {
      if (isNotFound(err)) return notFound(res)
      res.status(400).json({ message: 'Error al agregar productos' })
    }
  },

  async removeProduct(req: Request, res: Response) {
    try {
      await catalogsService.removeProduct(req.params.id, req.params.productId)
      res.json({ message: 'Producto removido del catálogo' })
    } catch {
      res.status(400).json({ message: 'Error al remover el producto' })
    }
  },

  async reorderProducts(req: Request, res: Response) {
    try {
      const { items } = reorderSchema.parse(req.body)
      await catalogsService.reorderProducts(req.params.id, items)
      res.json({ message: 'Orden actualizado' })
    } catch {
      res.status(400).json({ message: 'Error al reordenar' })
    }
  },

  async setProductImageOverride(req: Request, res: Response) {
    try {
      const { imageOverrideId } = imageOverrideSchema.parse(req.body)
      await catalogsService.setProductImageOverride(
        req.params.id,
        req.params.productId,
        imageOverrideId,
      )
      res.json({ message: 'Imagen actualizada' })
    } catch {
      res.status(400).json({ message: 'Error al actualizar imagen' })
    }
  },

  async publish(req: Request, res: Response) {
    try {
      res.json(await catalogsService.publish(req.params.id))
    } catch {
      res.status(400).json({ message: 'Error al publicar' })
    }
  },

  async unpublish(req: Request, res: Response) {
    try {
      res.json(await catalogsService.unpublish(req.params.id))
    } catch {
      res.status(400).json({ message: 'Error al despublicar' })
    }
  },
}
