import { prisma } from '../config/database'

export const categoriesService = {
  // Árbol completo
  async getTree() {
    const all = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    })

    // Construir árbol en memoria
    const map = new Map(all.map((c) => ({ ...c, children: [] as typeof all })).map((c) => [c.id, c]))
    const roots: (typeof all[number] & { children: typeof all })[] = []

    for (const cat of map.values()) {
      if (cat.parentId) {
        map.get(cat.parentId)?.children.push(cat as never)
      } else {
        roots.push(cat as never)
      }
    }
    return roots
  },

  // Lista plana (para selects)
  async getFlat() {
    return prisma.category.findMany({ orderBy: { name: 'asc' } })
  },

  async create(data: { name: string; parentId?: string }) {
    return prisma.category.create({ data })
  },

  async update(id: string, data: { name?: string; parentId?: string | null }) {
    return prisma.category.update({ where: { id }, data })
  },

  async delete(id: string, reassignTo?: string) {
    if (reassignTo && reassignTo === id) {
      throw new Error('reassignTo no puede ser igual al id de la categoría que se elimina')
    }
    // Mover productos hijos a otra categoría (o null)
    await prisma.product.updateMany({
      where: { categoryId: id },
      data: { categoryId: reassignTo ?? null },
    })
    // Mover subcategorías al padre del eliminado (o a raíz)
    const cat = await prisma.category.findUnique({ where: { id } })
    await prisma.category.updateMany({
      where: { parentId: id },
      data: { parentId: cat?.parentId ?? null },
    })
    return prisma.category.delete({ where: { id } })
  },

  // Upsert por nombre (para CSV) — devuelve id
  async upsertByName(name: string): Promise<string> {
    const normalized = name.trim()
    let existing = await prisma.category.findFirst({
      where: { name: { equals: normalized, mode: 'insensitive' } },
    })
    if (!existing) {
      existing = await prisma.category.create({ data: { name: normalized } })
    }
    return existing.id
  },
}
