import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../config/database'

const HASH_ROUNDS = 10

// ── Schemas ───────────────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(80),
})

export const changeOwnPasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Ingresa la contraseña actual'),
  newPassword: z
    .string()
    .min(6, 'Mínimo 6 caracteres')
    .max(72, 'Máximo 72 caracteres'),
})

// ── Service ───────────────────────────────────────────────────────────────────

export const settingsService = {
  async getProfile(userId: string) {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id:        true,
        username:  true,
        name:      true,
        role:      true,
        active:    true,
        createdAt: true,
      },
    })
    return user
  },

  async updateProfile(userId: string, body: unknown) {
    const data = updateProfileSchema.parse(body)
    const user = await prisma.user.update({
      where: { id: userId },
      data:  { name: data.name },
      select: {
        id:        true,
        username:  true,
        name:      true,
        role:      true,
        active:    true,
        createdAt: true,
      },
    })
    return user
  },

  async changeOwnPassword(userId: string, body: unknown) {
    const { currentPassword, newPassword } = changeOwnPasswordSchema.parse(body)

    const user = await prisma.user.findUniqueOrThrow({
      where:  { id: userId },
      select: { passwordHash: true },
    })

    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) throw new Error('La contraseña actual es incorrecta')

    const passwordHash = await bcrypt.hash(newPassword, HASH_ROUNDS)
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } })
    return { ok: true }
  },
}
