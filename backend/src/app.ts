import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import path from 'path'
import authRoutes       from './routes/auth.routes'
import productsRoutes   from './routes/products.routes'
import categoriesRoutes from './routes/categories.routes'
import imagesRoutes     from './routes/images.routes'
import catalogsRoutes   from './routes/catalogs.routes'
import pdfJobsRoutes   from './routes/pdf-jobs.routes'
import usersRoutes     from './routes/users.routes'
import settingsRoutes  from './routes/settings.routes'

const app = express()

// ---- Seguridad ----
app.use(helmet())

// ---- CORS ----
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}))

// ---- Rate limiting ----
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,                   // máx 20 intentos de login por ventana
  message: { message: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' },
}))

app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 5000,
}))

// ---- Body parsing ----
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.resolve(process.cwd(), 'storage')))

// ---- Routes ----
app.use('/api/auth',       authRoutes)
app.use('/api/products',   productsRoutes)
app.use('/api/categories', categoriesRoutes)
app.use('/api/images',     imagesRoutes)
app.use('/api/catalogs',   catalogsRoutes)
app.use('/api/pdf-jobs',  pdfJobsRoutes)
app.use('/api/users',     usersRoutes)
app.use('/api/settings',  settingsRoutes)

// ---- Health check ----
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ---- 404 ----
app.use((_req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' })
})

// ---- Error handler ----
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[server]', err)
  res.status(500).json({ message: 'Error interno del servidor' })
})

export default app
