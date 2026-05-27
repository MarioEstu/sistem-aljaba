import { prisma } from '../config/database'
import { z } from 'zod'

// ─── Slug helpers ──────────────────────────────────────────────────────────────

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'catalogo'
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = base
  let suffix = 0
  for (;;) {
    const existing = await prisma.catalog.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    })
    if (!existing) return slug
    suffix++
    slug = `${base}-${suffix}`
  }
}

// ─── Schemas ───────────────────────────────────────────────────────────────────

export const catalogCreateSchema = z.object({
  name:        z.string().min(1).max(255),
  description: z.string().optional().nullable(),
  config:      z.record(z.unknown()).optional(),
})

export const catalogUpdateSchema = catalogCreateSchema.partial()

export const addProductsSchema = z.object({
  productIds: z.array(z.string().uuid()).min(1),
})

export const reorderSchema = z.object({
  items: z
    .array(z.object({ productId: z.string().uuid(), position: z.number().int().min(0) }))
    .min(1),
})

export const imageOverrideSchema = z.object({
  imageOverrideId: z.string().uuid().nullable(),
})

// ─── Prisma includes ───────────────────────────────────────────────────────────

const catalogProductInclude = {
  product: { include: { image: true, category: true } },
  imageOverride: true,
} as const

const catalogInclude = {
  creator:  { select: { id: true, username: true, name: true } },
  products: { include: catalogProductInclude, orderBy: { position: 'asc' as const } },
  _count:   { select: { products: true } },
} as const

const catalogListInclude = {
  creator: { select: { id: true, username: true, name: true } },
  _count:  { select: { products: true } },
} as const

// ─── Service ───────────────────────────────────────────────────────────────────

export const catalogsService = {
  async list() {
    return prisma.catalog.findMany({
      include:  catalogListInclude,
      orderBy:  { updatedAt: 'desc' },
    })
  },

  async listForGuest() {
    return prisma.catalog.findMany({
      where:   { guestVisible: true },
      include: catalogListInclude,
      orderBy: { updatedAt: 'desc' },
    })
  },

  async getById(id: string) {
    const catalog = await prisma.catalog.findUnique({
      where:   { id },
      include: catalogInclude,
    })
    if (!catalog) throw new Error('NOT_FOUND')
    return catalog
  },

  async create(data: z.infer<typeof catalogCreateSchema>, createdBy: string) {
    const base = toSlug(data.name)
    const slug = await uniqueSlug(base)
    return prisma.catalog.create({
      data: {
        name:        data.name,
        slug,
        description: data.description ?? null,
        config:      (data.config as object) ?? {},
        createdBy,
      },
      include: catalogInclude,
    })
  },

  async update(id: string, data: z.infer<typeof catalogUpdateSchema>) {
    const existing = await prisma.catalog.findUnique({ where: { id } })
    if (!existing) throw new Error('NOT_FOUND')

    let slug = existing.slug
    if (data.name && data.name !== existing.name) {
      slug = await uniqueSlug(toSlug(data.name), id)
    }

    return prisma.catalog.update({
      where: { id },
      data: {
        ...(data.name        !== undefined ? { name: data.name }               : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.config      !== undefined ? { config: data.config as object } : {}),
        slug,
      },
      include: catalogInclude,
    })
  },

  async delete(id: string) {
    const existing = await prisma.catalog.findUnique({ where: { id } })
    if (!existing) throw new Error('NOT_FOUND')
    return prisma.catalog.delete({ where: { id } })
  },

  async getPublic(slug: string) {
    const catalog = await prisma.catalog.findFirst({
      where:   { slug, guestVisible: true },
      include: catalogInclude,
    })
    if (!catalog) throw new Error('NOT_FOUND')
    return catalog
  },

  async addProducts(catalogId: string, productIds: string[]) {
    const existing = await prisma.catalog.findUnique({ where: { id: catalogId } })
    if (!existing) throw new Error('NOT_FOUND')

    const maxPos = await prisma.catalogProduct.aggregate({
      where: { catalogId },
      _max:  { position: true },
    })
    let nextPos = (maxPos._max.position ?? -1) + 1

    const alreadyIn = await prisma.catalogProduct.findMany({
      where:  { catalogId, productId: { in: productIds } },
      select: { productId: true },
    })
    const alreadySet = new Set(alreadyIn.map((r) => r.productId))

    const toCreate = productIds
      .filter((pid) => !alreadySet.has(pid))
      .map((productId) => ({ catalogId, productId, position: nextPos++ }))

    if (toCreate.length > 0) {
      await prisma.catalogProduct.createMany({ data: toCreate })
    }

    return prisma.catalog.findUnique({ where: { id: catalogId }, include: catalogInclude })
  },

  async removeProduct(catalogId: string, productId: string) {
    await prisma.catalogProduct.deleteMany({ where: { catalogId, productId } })
  },

  async reorderProducts(
    catalogId: string,
    items: Array<{ productId: string; position: number }>,
  ) {
    if (items.length === 0) return

    // Batch into chunks of 200 and execute each chunk as a single DB transaction,
    // reducing round-trips from N to ceil(N/200) — a 200× improvement at scale.
    const CHUNK = 200
    for (let i = 0; i < items.length; i += CHUNK) {
      const chunk = items.slice(i, i + CHUNK)
      await prisma.$transaction(
        chunk.map(({ productId, position }) =>
          prisma.catalogProduct.updateMany({
            where: { catalogId, productId },
            data:  { position },
          }),
        ),
      )
    }
  },

  async setProductImageOverride(
    catalogId: string,
    productId: string,
    imageOverrideId: string | null,
  ) {
    await prisma.catalogProduct.updateMany({
      where: { catalogId, productId },
      data:  { imageOverrideId },
    })
  },

  async publish(id: string) {
    return prisma.catalog.update({
      where:   { id },
      data:    { guestVisible: true },
      include: catalogInclude,
    })
  },

  async unpublish(id: string) {
    return prisma.catalog.update({
      where:   { id },
      data:    { guestVisible: false },
      include: catalogInclude,
    })
  },
}
