import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../config/database'

// ── Schemas ───────────────────────────────────────────────────────────────────

export const createUserSchema = z.object({
  username: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(32, 'Máximo 32 caracteres')
    .regex(/^[a-z0-9_.-]+$/i, 'Solo letras, números, guiones y puntos'),
  name:     z.string().min(2, 'Mínimo 2 caracteres').max(80),
  password: z.string().min(6, 'Mínimo 6 caracteres').max(72),
  role:     z.enum(['admin', 'guest']).default('guest'),
  active:   z.boolean().default(true),
})

export const updateUserSchema = z.object({
  name:   z.string().min(2).max(80).optional(),
  role:   z.enum(['admin', 'guest']).optional(),
  active: z.boolean().optional(),
})

export const changePasswordSchema = z.object({
  password: z.string().min(6, 'Mínimo 6 caracteres').max(72),
})

// ── Helpers ───────────────────────────────────────────────────────────────────

const HASH_ROUNDS = 10

function publicUser(u: {
  id: string
  username: string
  name: string
  role: string
  active: boolean
  createdAt: Date
}) {
  return {
    id:        u.id,
    username:  u.username,
    name:      u.name,
    role:      u.role,
    active:    u.active,
    createdAt: u.createdAt,
  }
}

// ── Service ───────────────────────────────────────────────────────────────────

export const usersService = {
  async list() {
    const users = await prisma.user.findMany({
      orderBy: [{ role: 'asc' }, { username: 'asc' }],
      select: {
        id:        true,
        username:  true,
        name:      true,
        role:      true,
        active:    true,
        createdAt: true,
        _count: {
          select: { pdfJobs: true, catalogs: true },
        },
      },
    })
    return users.map((u) => ({
      ...publicUser(u),
      pdfJobsCount:  u._count.pdfJobs,
      catalogsCount: u._count.catalogs,
    }))
  },

  async getById(id: string) {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id },
      select: {
        id:        true,
        username:  true,
        name:      true,
        role:      true,
        active:    true,
        createdAt: true,
        _count: { select: { pdfJobs: true, catalogs: true } },
      },
    })
    return {
      ...publicUser(user),
      pdfJobsCount:  user._count.pdfJobs,
      catalogsCount: user._count.catalogs,
    }
  },

  async create(body: unknown) {
    const data = createUserSchema.parse(body)

    const existing = await prisma.user.findUnique({ where: { username: data.username } })
    if (existing) throw new Error('El nombre de usuario ya existe')

    const passwordHash = await bcrypt.hash(data.password, HASH_ROUNDS)
    const user = await prisma.user.create({
      data: {
        username:     data.username,
        name:         data.name,
        passwordHash,
        role:         data.role,
        active:       data.active,
      },
    })
    return publicUser(user)
  },

  async update(id: string, body: unknown, requesterId: string) {
    const data = updateUserSchema.parse(body)

    // Prevent admin from changing their own role or deactivating themselves
    if (id === requesterId) {
      if (data.role !== undefined) {
        throw new Error('No puedes cambiar tu propio rol')
      }
      if (data.active === false) {
        throw new Error('No puedes desactivar tu propia cuenta')
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data:  {
        ...(data.name   !== undefined ? { name:   data.name }   : {}),
        ...(data.role   !== undefined ? { role:   data.role }   : {}),
        ...(data.active !== undefined ? { active: data.active } : {}),
      },
    })
    return publicUser(user)
  },

  async changePassword(id: string, body: unknown) {
    const { password } = changePasswordSchema.parse(body)
    const passwordHash = await bcrypt.hash(password, HASH_ROUNDS)
    await prisma.user.update({ where: { id }, data: { passwordHash } })
    return { ok: true }
  },

  async delete(id: string, requesterId: string) {
    if (id === requesterId) {
      throw new Error('No puedes eliminar tu propia cuenta')
    }
    // Check they exist
    await prisma.user.findUniqueOrThrow({ where: { id } })
    await prisma.user.delete({ where: { id } })
    return { deleted: true, userId: id }
  },

  async toggleActive(id: string, requesterId: string) {
    if (id === requesterId) {
      throw new Error('No puedes desactivar tu propia cuenta')
    }
    const user = await prisma.user.findUniqueOrThrow({ where: { id } })
    const updated = await prisma.user.update({
      where: { id },
      data:  { active: !user.active },
    })
    return publicUser(updated)
  },
}
