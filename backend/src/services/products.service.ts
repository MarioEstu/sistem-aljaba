import { prisma } from '../config/database'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

// ---- Schemas ----
export const productCreateSchema = z.object({
  name:        z.string().min(1).max(255),
  code:        z.string().min(1).max(100),
  description: z.string().max(5000).optional().nullable(),
  categoryId:  z.string().uuid().optional().nullable(),
  price1:      z.number().positive().optional().nullable(),
  price2:      z.number().positive().optional().nullable(),
  price3:      z.number().positive().optional().nullable(),
  price4:      z.number().positive().optional().nullable(),
  price5:      z.number().positive().optional().nullable(),
  price6:      z.number().positive().optional().nullable(),
  stock:       z.number().int().min(0).optional().nullable(),
  imageId:     z.string().uuid().optional().nullable(),
})

export const productUpdateSchema = productCreateSchema.partial()

export const productsQuerySchema = z.object({
  search:     z.string().optional(),
  categoryId: z.string().optional(),
  page:       z.coerce.number().int().min(1).default(1),
  limit:      z.coerce.number().int().min(1).max(2000).default(50),
  orderBy:    z.enum(['name', 'code', 'price1', 'stock', 'createdAt']).default('name'),
  order:      z.enum(['asc', 'desc']).default('asc'),
  noImage:    z.coerce.boolean().optional(),
})

export const bulkActionSchema = z.discriminatedUnion('action', [
  z.object({
    action:     z.literal('changeCategory'),
    ids:        z.array(z.string().uuid()).min(1),
    categoryId: z.string().uuid().nullable(),
  }),
  z.object({
    action:   z.literal('applyDiscount'),
    ids:      z.array(z.string().uuid()).min(1),
    percent:  z.number().min(1).max(99),
  }),
  z.object({
    action: z.literal('updateStock'),
    ids:    z.array(z.string().uuid()).min(1),
    stock:  z.number().int().min(0),
  }),
  z.object({
    action:  z.literal('delete'),
    ids:     z.array(z.string().uuid()).min(1),
  }),
])

// ---- Service ----
export const productsService = {
  async list(raw: unknown) {
    const q = productsQuerySchema.parse(raw)
    const skip = (q.page - 1) * q.limit

    const where: Prisma.ProductWhereInput = {}
    if (q.search) {
      where.OR = [
        { name: { contains: q.search, mode: 'insensitive' } },
        { code: { contains: q.search, mode: 'insensitive' } },
      ]
    }
    if (q.categoryId) where.categoryId = q.categoryId
    if (q.noImage)    where.imageId = null

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      q.orderBy === 'createdAt'
        ? { createdAt: q.order }
        : { [q.orderBy]: q.order }

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: q.limit,
        orderBy,
        include: {
          category: { select: { id: true, name: true } },
          image:    { select: { id: true, url: true, thumbnailUrl: true, filename: true } },
        },
      }),
      prisma.product.count({ where }),
    ])

    return { data, total, page: q.page, limit: q.limit }
  },

  async getById(id: string) {
    return prisma.product.findUniqueOrThrow({
      where: { id },
      include: {
        category: true,
        image:    true,
      },
    })
  },

  async create(raw: z.infer<typeof productCreateSchema>) {
    const data: Prisma.ProductCreateInput = raw as Prisma.ProductCreateInput

    // Auto-vincular imagen si el code coincide con el baseName de una imagen existente
    // y no se especificó imageId explícitamente.
    if (!raw.imageId && raw.code) {
      const codeAlt = raw.code.includes('-')
        ? raw.code.replace(/-/g, '_')   // "FD-30" → "FD_30"
        : raw.code.replace(/_/g, '-')   // "FD_30" → "FD-30"
      const matchingImage = await prisma.image.findFirst({
        where: {
          OR: [
            { filename: { startsWith: `${raw.code}.`, mode: 'insensitive' } },
            { filename: { startsWith: `${codeAlt}.`,  mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      })
      if (matchingImage) {
        (data as Record<string, unknown>).imageId = matchingImage.id
      }
    }

    return prisma.product.create({ data })
  },

  async update(id: string, data: z.infer<typeof productUpdateSchema>) {
    return prisma.product.update({ where: { id }, data })
  },

  async delete(id: string) {
    return prisma.product.delete({ where: { id } })
  },

  async bulkAction(raw: unknown) {
    const action = bulkActionSchema.parse(raw)

    switch (action.action) {
      case 'changeCategory':
        return prisma.product.updateMany({
          where: { id: { in: action.ids } },
          data:  { categoryId: action.categoryId },
        })

      case 'applyDiscount': {
        // Single SQL UPDATE for all selected products — O(1) round-trips regardless of selection size.
        // NULL prices stay NULL (NULL * factor = NULL in PostgreSQL).
        // Note: Prisma maps Product model → "products" table (snake_case, lowercase).
        const factor = (100 - action.percent) / 100
        await prisma.$executeRaw`
          UPDATE "products"
          SET
            "price1" = ROUND(CAST("price1" * ${factor} AS NUMERIC), 2),
            "price2" = ROUND(CAST("price2" * ${factor} AS NUMERIC), 2),
            "price3" = ROUND(CAST("price3" * ${factor} AS NUMERIC), 2),
            "price4" = ROUND(CAST("price4" * ${factor} AS NUMERIC), 2),
            "price5" = ROUND(CAST("price5" * ${factor} AS NUMERIC), 2),
            "price6" = ROUND(CAST("price6" * ${factor} AS NUMERIC), 2)
          WHERE "id" IN (${Prisma.join(action.ids)})
        `
        return { count: action.ids.length }
      }

      case 'updateStock':
        return prisma.product.updateMany({
          where: { id: { in: action.ids } },
          data:  { stock: action.stock },
        })

      case 'delete':
        return prisma.product.deleteMany({ where: { id: { in: action.ids } } })
    }
  },
}
