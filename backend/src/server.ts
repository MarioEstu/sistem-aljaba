import 'dotenv/config'
import app from './app'
import { prisma } from './config/database'
import puppeteer from 'puppeteer'

const PORT = Number(process.env.PORT) || 4000

async function checkPuppeteer(): Promise<void> {
  const launchOptions: Parameters<typeof puppeteer.launch>[0] = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  }
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH
    console.log(`  Puppeteer: usando Chrome en ${process.env.PUPPETEER_EXECUTABLE_PATH}`)
  }

  try {
    const browser = await puppeteer.launch(launchOptions)
    await browser.close()
    console.log('✓ Puppeteer/Chrome disponible — generación de PDF activa')
  } catch (err) {
    console.warn('⚠ Puppeteer no pudo iniciar — la generación de PDF estará desactivada.')
    console.warn('  Para habilitar PDF en Linux/CI, define PUPPETEER_EXECUTABLE_PATH:')
    console.warn('  PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser npm run dev')
    // No se hace process.exit: el servidor arranca igualmente; PDF fallará por job.
  }
}

async function main() {
  try {
    await prisma.$connect()
    console.log('✓ Base de datos conectada')
  } catch (err) {
    console.error('✗ Error conectando a la base de datos:', err)
    console.log('  Asegúrate de que PostgreSQL esté corriendo (docker compose up -d)')
    process.exit(1)
  }

  await checkPuppeteer()

  app.listen(PORT, () => {
    console.log(`✓ Servidor corriendo en http://localhost:${PORT}`)
    console.log(`  Health: http://localhost:${PORT}/api/health`)
    console.log(`  Env: ${process.env.NODE_ENV || 'development'}`)
  })
}

main().catch(console.error)
