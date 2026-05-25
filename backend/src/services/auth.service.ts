import bcrypt from 'bcryptjs'
import { prisma } from '../config/database'
import { signToken } from '../config/jwt'
import { z } from 'zod'

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

export const authService = {
  async login(body: unknown) {
    const { username, password } = loginSchema.parse(body)

    const user = await prisma.user.findUnique({ where: { username } })
    if (!user || !user.active) {
      throw new Error('INVALID_CREDENTIALS')
    }

    const match = await bcrypt.compare(password, user.passwordHash)
    if (!match) {
      throw new Error('INVALID_CREDENTIALS')
    }

    const token = signToken({ sub: user.id, username: user.username, role: user.role })

    return {
      token,
      user: {
        id:       user.id,
        username: user.username,
        name:     user.name,
        role:     user.role,
        active:   user.active,
      },
    }
  },

  async me(userId: string) {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } })
    return {
      id:       user.id,
      username: user.username,
      name:     user.name,
      role:     user.role,
      active:   user.active,
    }
  },
}
