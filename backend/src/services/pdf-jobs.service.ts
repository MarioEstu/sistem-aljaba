import fs from 'fs/promises'
import path from 'path'
import puppeteer from 'puppeteer'
import { prisma } from '../config/database'
import { buildCatalogHtml } from './pdf-template.service'
import type { Catalog, CatalogConfig, CatalogProductEntry } from '../types/catalog'

// ── Storage ──────────────────────────────────────────────────────────────────
const STORAGE_DIR = path.resolve(process.cwd(), 'storage')
const PDF_DIR     = path.join(STORAGE_DIR, 'pdfs')

async function ensurePdfDir() {
  await fs.mkdir(PDF_DIR, { recursive: true })
}

function pdfLocalPath(jobId: string): string {
  return path.join(PDF_DIR, `${jobId}.pdf`)
}

function pdfPublicUrl(jobId: string): string {
  // Served by the express static middleware at /uploads/pdfs/:jobId.pdf
  return `/uploads/pdfs/${jobId}.pdf`
}

// ── Image → base64 ────────────────────────────────────────────────────────────
const MIME: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
  gif: 'image/gif',  webp: 'image/webp', svg: 'image/svg+xml',
}

async function imageUrlToBase64(relUrl: string): Promise<string | null> {
  if (!relUrl || !relUrl.startsWith('/uploads/')) return null
  const rel      = relUrl.slice('/uploads/'.length)
  const filePath = path.join(STORAGE_DIR, rel)
  try {
    const buffer = await fs.readFile(filePath)
    const ext    = path.extname(filePath).slice(1).toLowerCase()
    const mime   = MIME[ext] ?? 'image/jpeg'
    return `data:${mime};base64,${buffer.toString('base64')}`
  } catch {
    return null
  }
}

async function buildImageMap(entries: CatalogProductEntry[]): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  for (const entry of entries) {
    for (const img of [entry.imageOverride, entry.product.image]) {
      if (!img) continue
      for (const url of [img.thumbnailUrl, img.url]) {
        if (url && !map.has(url)) {
          const b64 = await imageUrlToBase64(url)
          if (b64) map.set(url, b64)
        }
      }
    }
  }
  return map
}

// ── Puppeteer ─────────────────────────────────────────────────────────────────
// PUPPETEER_EXECUTABLE_PATH: ruta al ejecutable de Chrome/Chromium.
// - Windows/Mac de desarrollo: dejar vacío (Puppeteer usa su Chrome descargado).
// - Linux sin GUI (CI, VPS): apuntar a chromium-browser o google-chrome, p.ej.:
//   PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
// - Docker headless: usar imagen browserless/chrome o pasar --no-sandbox + path.
async function htmlToPdf(html: string, format: string): Promise<Buffer> {
  const isLandscape = format === 'A4-horizontal'
  const paperFormat: 'A4' | 'Letter' = format === 'letter' ? 'Letter' : 'A4'

  const launchOptions: Parameters<typeof puppeteer.launch>[0] = {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
    ],
  }

  // Respetar executablePath si está configurado en el entorno
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH
  }

  const browser = await puppeteer.launch(launchOptions)

  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'load' })

    const pdfBuffer = await page.pdf({
      format: paperFormat,
      landscape: isLandscape,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    })

    return Buffer.from(pdfBuffer)
  } finally {
    await browser.close()
  }
}

// ── Catalog loader ────────────────────────────────────────────────────────────
async function loadCatalogForPdf(catalogId: string): Promise<Catalog> {
  const catalog = await prisma.catalog.findUniqueOrThrow({
    where: { id: catalogId },
    include: {
      products: {
        orderBy: { position: 'asc' },
        include: {
          product: {
            include: { image: true },
          },
          imageOverride: true,
        },
      },
    },
  })

  return catalog as unknown as Catalog
}

// ── Default config fallback ───────────────────────────────────────────────────
const DEFAULT_CFG: CatalogConfig = {
  layout:          'grid4',
  format:          'A4-vertical',
  productsPerPage: 12,
  showCode:        true,
  showDescription: false,
  showPrice1:      true,
  showPrices2to6:  false,
  showStock:       false,
  logoOnEachPage:  true,
}

function mergeConfig(raw: unknown): CatalogConfig {
  if (!raw || typeof raw !== 'object') return DEFAULT_CFG
  return { ...DEFAULT_CFG, ...(raw as Partial<CatalogConfig>) }
}

// ── Worker ────────────────────────────────────────────────────────────────────
// Simple in-process async queue: one job at a time
let workerRunning = false
const jobQueue: string[] = []  // list of job IDs

async function processNext() {
  if (workerRunning || jobQueue.length === 0) return
  workerRunning = true
  const jobId = jobQueue.shift()!

  try {
    // Mark as processing
    const job = await prisma.pdfJob.update({
      where:  { id: jobId },
      data:   { status: 'processing', startedAt: new Date() },
      select: { catalogId: true },
    })

    // Load catalog data
    const catalog  = await loadCatalogForPdf(job.catalogId)
    const config   = mergeConfig(catalog.config)
    const entries  = catalog.products

    // Embed product images as base64 so Puppeteer needs no network requests
    const imageMap = await buildImageMap(entries)

    // Build HTML and convert to PDF
    const baseUrl = `http://localhost:${process.env.PORT ?? 4000}`
    const html    = buildCatalogHtml({ catalog, entries, config, imageMap }, baseUrl)
    const pdfBuffer = await htmlToPdf(html, config.format)

    // Save file
    await ensurePdfDir()
    await fs.writeFile(pdfLocalPath(jobId), pdfBuffer)
    const publicUrl = pdfPublicUrl(jobId)

    // Update job and catalog
    await prisma.$transaction([
      prisma.pdfJob.update({
        where: { id: jobId },
        data:  { status: 'completed', completedAt: new Date() },
      }),
      prisma.catalog.update({
        where: { id: job.catalogId },
        data:  { pdfUrl: publicUrl },
      }),
    ])
  } catch (err) {
    console.error('[pdf-worker] Error procesando job', jobId, err)
    await prisma.pdfJob.update({
      where: { id: jobId },
      data:  {
        status:       'failed',
        errorMessage: err instanceof Error ? err.message : 'Error desconocido',
        completedAt:  new Date(),
      },
    }).catch(() => {/* ignore secondary failure */})
  } finally {
    workerRunning = false
    // Process next in queue
    setImmediate(processNext)
  }
}

function enqueueJob(jobId: string) {
  jobQueue.push(jobId)
  setImmediate(processNext)
}

// ── Public API ────────────────────────────────────────────────────────────────
export const pdfJobsService = {
  async create(catalogId: string, requestedBy: string) {
    // Check catalog exists
    await prisma.catalog.findUniqueOrThrow({ where: { id: catalogId } })

    // Cancel any pending/processing jobs for this catalog (avoid stacking)
    await prisma.pdfJob.updateMany({
      where:  { catalogId, status: { in: ['pending', 'processing'] } },
      data:   { status: 'failed', errorMessage: 'Reemplazado por nuevo trabajo' },
    })

    const job = await prisma.pdfJob.create({
      data: {
        catalogId,
        requestedBy,
        status: 'pending',
      },
    })

    enqueueJob(job.id)
    return job
  },

  async list(catalogId?: string) {
    return prisma.pdfJob.findMany({
      where:   catalogId ? { catalogId } : {},
      orderBy: { createdAt: 'desc' },
      take:    100,
      include: {
        catalog:   { select: { id: true, name: true, slug: true, pdfUrl: true } },
        requester: { select: { id: true, username: true, name: true } },
      },
    })
  },

  async getById(id: string) {
    return prisma.pdfJob.findUniqueOrThrow({
      where:   { id },
      include: {
        catalog:   { select: { id: true, name: true, slug: true, pdfUrl: true } },
        requester: { select: { id: true, username: true, name: true } },
      },
    })
  },

  async delete(id: string) {
    const job = await prisma.pdfJob.findUniqueOrThrow({ where: { id } })

    // Remove file if exists
    try {
      await fs.rm(pdfLocalPath(id), { force: true })
    } catch {/* ignore */}

    await prisma.pdfJob.delete({ where: { id } })
    return { deleted: true, jobId: id, status: job.status }
  },

  // Retry a failed job
  async retry(id: string) {
    const job = await prisma.pdfJob.findUniqueOrThrow({ where: { id } })
    if (job.status !== 'failed') {
      throw new Error('Solo se pueden reintentar trabajos fallidos')
    }

    const newJob = await prisma.pdfJob.create({
      data: {
        catalogId:   job.catalogId,
        requestedBy: job.requestedBy,
        status:      'pending',
      },
    })

    enqueueJob(newJob.id)
    return newJob
  },
}
