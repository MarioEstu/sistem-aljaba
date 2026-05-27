import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { prisma } from '../config/database'

async function seed() {
  console.log('Iniciando seed de la base de datos...')

  // Admin por defecto
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: { name: 'Administrador Aljaba' },
    create: {
      username: 'admin',
      passwordHash: adminPassword,
      name: 'Administrador Aljaba',
      role: 'admin',
      active: true,
    },
  })
  console.log('✓ Usuario admin creado:', admin.username)

  // Usuario de prueba guest
  const guestPassword = await bcrypt.hash('guest123', 12)
  const guest = await prisma.user.upsert({
    where: { username: 'rutero01' },
    update: { name: 'Juan Pérez (Rutero)' },
    create: {
      username: 'rutero01',
      passwordHash: guestPassword,
      name: 'Juan Pérez (Rutero)',
      role: 'guest',
      active: true,
    },
  })
  console.log('✓ Usuario guest creado:', guest.username)

  // Categorías base
  const cats = [
    { name: 'Iluminación' },
    { name: 'Plomería' },
    { name: 'Ferretería' },
    { name: 'Papelería' },
    { name: 'Electricidad' },
  ]
  for (const cat of cats) {
    await prisma.category.upsert({
      where: { id: cat.name },
      update: {},
      create: { id: cat.name, name: cat.name },
    }).catch(async () => {
      // Si falla el upsert por id, buscar por nombre
      const existing = await prisma.category.findFirst({ where: { name: cat.name } })
      if (!existing) {
        await prisma.category.create({ data: { name: cat.name } })
        console.log('✓ Categoría creada:', cat.name)
      }
    })
  }

  console.log('\n✓ Seed completado')
  console.log('  Usuario admin creado (ver .env.example para instrucciones de acceso)')
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
