import fs from 'fs/promises'
import path from 'path'
import { createHash } from 'crypto'
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import sharp from 'sharp'
import { z } from 'zod'
import { prisma } from '../config/database'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const MAX_DIMENSION = 2000
const THUMB_SIZE = 300
const LOCAL_STORAGE_ROOT = path.resolve(process.cwd(), 'storage')
const LOCAL_IMAGES_DIR = path.join(LOCAL_STORAGE_ROOT, 'images')
const LOCAL_THUMBS_DIR = path.join(LOCAL_STORAGE_ROOT, 'thumbnails')
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

const imagesQuerySchema = z.object({
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(2000).default(24),
  unlinkedOnly: z.coerce.boolean().optional(),
})

type OutputFormat = 'jpeg' | 'png' | 'webp'

interface ProcessedImage {
  buffer: Buffer
  thumbnailBuffer: Buffer
  contentType: string
  extension: string
  width: number
  height: number
  sizeBytes: number
}

function getBaseName(filename: string) {
  return path.parse(filename).name.trim()
}

function normalizeBaseName(filename: string) {
  return getBaseName(filename).toLowerCase()
}

function sanitizeSegment(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[^\w\- ]+/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/_+/g, '_')
    || 'image'
}

function hashSegment(value: string) {
  return createHash('sha1').update(value).digest('hex').slice(0, 10)
}

function resolveOutputFormat(mimeType?: string, forcedExtension?: string): OutputFormat {
  const ext = forcedExtension?.toLowerCase()
  if (ext === '.png') return 'png'
  if (ext === '.webp') return 'webp'
  if (mimeType === 'image/png') return 'png'
  if (mimeType === 'image/webp') return 'webp'
  return 'jpeg'
}

function getContentType(format: OutputFormat) {
  if (format === 'png') return 'image/png'
  if (format === 'webp') return 'image/webp'
  return 'image/jpeg'
}

function getExtension(format: OutputFormat) {
  if (format === 'png') return '.png'
  if (format === 'webp') return '.webp'
  return '.jpg'
}

async function ensureLocalDirs() {
  await fs.mkdir(LOCAL_IMAGES_DIR, { recursive: true })
  await fs.mkdir(LOCAL_THUMBS_DIR, { recursive: true })
}

function shouldUseS3() {
  return Boolean(
    process.env.S3_BUCKET_NAME &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    (process.env.S3_REGION || process.env.S3_ENDPOINT),
  )
}

function createS3Client() {
  return new S3Client({
    region: process.env.S3_REGION || 'us-east-1',
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: Boolean(process.env.S3_ENDPOINT),
    credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
  })
}

function buildStoragePaths(baseName: string, format: OutputFormat) {
  const normalized = baseName.toLowerCase()
  const safeBase = sanitizeSegment(baseName)
  const hash = hashSegment(normalized)
  const extension = getExtension(format)
  const fileStem = `${safeBase}-${hash}`

  return {
    extension,
    imageKey: `images/${fileStem}${extension}`,
    thumbnailKey: `thumbnails/${fileStem}.jpg`,
  }
}

function getThumbnailKeyFromFilename(filename: string) {
  return buildStoragePaths(
    getBaseName(filename),
    resolveOutputFormat(undefined, path.extname(filename)),
  ).thumbnailKey
}

function localUrlFromKey(key: string) {
  return `/uploads/${key.replace(/\\/g, '/')}`
}

function buildPublicUrl(key: string) {
  if (shouldUseS3()) {
    const base = process.env.S3_PUBLIC_BASE_URL?.replace(/\/$/, '')
    if (base) return `${base}/${key}`
  }
  return localUrlFromKey(key)
}

async function uploadToStorage(key: string, body: Buffer, contentType: string) {
  if (shouldUseS3()) {
    const client = createS3Client()
    await client.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
      ACL: 'public-read',
    }))
    return
  }

  await ensureLocalDirs()
  await fs.writeFile(path.join(LOCAL_STORAGE_ROOT, key), body)
}

async function deleteFromStorage(key?: string | null) {
  if (!key) return

  if (shouldUseS3()) {
    const client = createS3Client()
    await client.send(new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    }))
    return
  }

  await fs.rm(path.join(LOCAL_STORAGE_ROOT, key), { force: true })
}

async function processImageBuffer(
  buffer: Buffer,
  mimeType?: string,
  forcedExtension?: string,
): Promise<ProcessedImage> {
  const format = resolveOutputFormat(mimeType, forcedExtension)
  const input = sharp(buffer, { failOn: 'none' }).rotate()
  const optimized = input
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: 'inside',
      withoutEnlargement: true,
    })

  let mainPipeline: sharp.Sharp
  if (format === 'png') {
    mainPipeline = optimized.png({ quality: 85, compressionLevel: 9 })
  } else if (format === 'webp') {
    mainPipeline = optimized.webp({ quality: 85 })
  } else {
    mainPipeline = optimized.jpeg({ quality: 85, mozjpeg: true })
  }

  const { data, info } = await mainPipeline.toBuffer({ resolveWithObject: true })
  const thumbnailBuffer = await sharp(data)
    .resize(THUMB_SIZE, THUMB_SIZE, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer()

  return {
    buffer: data,
    thumbnailBuffer,
    contentType: getContentType(format),
    extension: getExtension(format),
    width: info.width,
    height: info.height,
    sizeBytes: data.byteLength,
  }
}

async function upsertSingleImage(file: Express.Multer.File) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    throw new Error(`Formato no soportado: ${file.originalname}`)
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Archivo excede 10MB: ${file.originalname}`)
  }

  const baseName = getBaseName(file.originalname)
  if (!baseName) {
    throw new Error(`Nombre de archivo inválido: ${file.originalname}`)
  }

  const processed = await processImageBuffer(file.buffer, file.mimetype)
  const filenames = buildStoragePaths(baseName, resolveOutputFormat(file.mimetype))
  const originalFilename = `${baseName}${processed.extension}`

  // Single indexed lookup instead of loading all images into memory (O(log N) vs O(N))
  const match = await prisma.image.findFirst({
    where: {
      OR: [
        { filename: { equals: `${baseName}.jpg`,  mode: 'insensitive' } },
        { filename: { equals: `${baseName}.jpeg`, mode: 'insensitive' } },
        { filename: { equals: `${baseName}.png`,  mode: 'insensitive' } },
        { filename: { equals: `${baseName}.webp`, mode: 'insensitive' } },
      ],
    },
    select: { id: true, filename: true, s3Key: true, thumbnailUrl: true, url: true },
  })

  await uploadToStorage(filenames.imageKey, processed.buffer, processed.contentType)
  await uploadToStorage(filenames.thumbnailKey, processed.thumbnailBuffer, 'image/jpeg')

  try {
    const saved = match
      ? await prisma.image.update({
          where: { id: match.id },
          data: {
            filename: originalFilename,
            url: buildPublicUrl(filenames.imageKey),
            thumbnailUrl: buildPublicUrl(filenames.thumbnailKey),
            s3Key: filenames.imageKey,
            sizeBytes: processed.sizeBytes,
            width: processed.width,
            height: processed.height,
          },
          include: {
            products: { select: { id: true, name: true, code: true } },
          },
        })
      : await prisma.image.create({
          data: {
            filename: originalFilename,
            url: buildPublicUrl(filenames.imageKey),
            thumbnailUrl: buildPublicUrl(filenames.thumbnailKey),
            s3Key: filenames.imageKey,
            sizeBytes: processed.sizeBytes,
            width: processed.width,
            height: processed.height,
          },
          include: {
            products: { select: { id: true, name: true, code: true } },
          },
        })

    // Vincula productos cuyo código coincide con el baseName del archivo,
    // tratando _ y - como equivalentes (ej: "FD_30.png" vincula a código "FD-30").
    const baseNormalized = baseName.replace(/_/g, '-')
    const linked = await prisma.product.updateMany({
      where: {
        imageId: null,
        OR: [
          { code: { equals: baseName,       mode: 'insensitive' } },
          { code: { equals: baseNormalized, mode: 'insensitive' } },
        ],
      },
      data: { imageId: saved.id },
    })

    if (match && match.s3Key !== filenames.imageKey) {
      await deleteFromStorage(match.s3Key)
      const previousThumbKey = getThumbnailKeyFromFilename(match.filename)
      if (previousThumbKey && previousThumbKey !== filenames.thumbnailKey) {
        await deleteFromStorage(previousThumbKey)
      }
    }

    return {
      overwritten: Boolean(match),
      autoLinkedProducts: linked.count,
      image: {
        ...saved,
        linkedProducts: saved.products,
        products: undefined,
        usageCount: saved.products.length,
      },
    }
  } catch (error) {
    await deleteFromStorage(filenames.imageKey)
    await deleteFromStorage(filenames.thumbnailKey)
    throw error
  }
}

export const imagesService = {
  async list(raw: unknown) {
    const query = imagesQuerySchema.parse(raw)
    const skip = (query.page - 1) * query.limit
    const startDate = query.startDate ? new Date(query.startDate) : undefined
    const endDate = query.endDate ? new Date(query.endDate) : undefined

    if (startDate && Number.isNaN(startDate.getTime())) {
      throw new Error('startDate inválido')
    }
    if (endDate && Number.isNaN(endDate.getTime())) {
      throw new Error('endDate inválido')
    }
    if (endDate) {
      endDate.setHours(23, 59, 59, 999)
    }

    const where = {
      ...(query.search
        ? { filename: { contains: query.search, mode: 'insensitive' as const } }
        : {}),
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          }
        : {}),
      ...(query.unlinkedOnly ? { products: { none: {} } } : {}),
    }

    const [data, total] = await Promise.all([
      prisma.image.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          products: {
            select: { id: true, name: true, code: true },
            orderBy: { name: 'asc' },
          },
        },
      }),
      prisma.image.count({ where }),
    ])

    return {
      data: data.map((image) => ({
        ...image,
        baseName: getBaseName(image.filename),
        linkedProducts: image.products,
        usageCount: image.products.length,
      })),
      total,
      page: query.page,
      limit: query.limit,
    }
  },

  async uploadMany(files: Express.Multer.File[]) {
    const results = []
    for (const file of files) {
      results.push(await upsertSingleImage(file))
    }
    return results
  },

  async overwrite(id: string, file: Express.Multer.File) {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new Error('Formato no soportado')
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('Archivo excede 10MB')
    }

    const existing = await prisma.image.findUniqueOrThrow({ where: { id } })
    const baseName = getBaseName(existing.filename)
    const forcedExt = path.extname(existing.filename)
    const processed = await processImageBuffer(file.buffer, file.mimetype, forcedExt)
    const format = resolveOutputFormat(file.mimetype, forcedExt)
    const filenames = buildStoragePaths(baseName, format)

    await uploadToStorage(filenames.imageKey, processed.buffer, processed.contentType)
    await uploadToStorage(filenames.thumbnailKey, processed.thumbnailBuffer, 'image/jpeg')

    if (existing.s3Key !== filenames.imageKey) {
      await deleteFromStorage(existing.s3Key)
    }
    const previousThumbKey = getThumbnailKeyFromFilename(existing.filename)
    if (previousThumbKey && previousThumbKey !== filenames.thumbnailKey) {
      await deleteFromStorage(previousThumbKey)
    }

    return prisma.image.update({
      where: { id },
      data: {
        filename: `${baseName}${processed.extension}`,
        url: buildPublicUrl(filenames.imageKey),
        thumbnailUrl: buildPublicUrl(filenames.thumbnailKey),
        s3Key: filenames.imageKey,
        sizeBytes: processed.sizeBytes,
        width: processed.width,
        height: processed.height,
      },
      include: {
        products: { select: { id: true, name: true, code: true } },
      },
    })
  },

  async delete(id: string) {
    const image = await prisma.image.findUniqueOrThrow({
      where: { id },
      include: { products: { select: { id: true } } },
    })

    await prisma.product.updateMany({
      where: { imageId: id },
      data: { imageId: null },
    })
    await prisma.image.delete({ where: { id } })

    await deleteFromStorage(image.s3Key)
    const thumbnailKey = getThumbnailKeyFromFilename(image.filename)
    if (thumbnailKey) {
      await deleteFromStorage(thumbnailKey)
    }

    return { unlinkedProducts: image.products.length }
  },
}