// ============================================
// Tipos globales — Catalog Aljaba
// ============================================

export type Role = 'admin' | 'guest'

export interface User {
  id: string
  username: string
  name: string
  role: Role
  active: boolean
  createdAt: string
}

export interface AuthTokenPayload {
  sub: string      // user id
  username: string
  role: Role
  iat?: number
  exp?: number
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: Omit<User, 'createdAt'>
}

// -------- Productos --------
export interface Product {
  id: string
  name: string
  code: string
  description?: string
  categoryId?: string
  price1?: number
  price2?: number
  price3?: number
  price4?: number
  price5?: number
  price6?: number
  stock?: number
  imageId?: string
  image?: ProductImage
  category?: Category
  createdAt: string
  updatedAt: string
}

// -------- Categorías --------
export interface Category {
  id: string
  name: string
  parentId?: string
  children?: Category[]
  createdAt: string
}

// -------- Imágenes --------
export interface ProductImage {
  id: string
  filename: string
  url: string
  thumbnailUrl?: string
  s3Key: string
  sizeBytes?: number
  width?: number
  height?: number
  createdAt: string
  baseName?: string
  usageCount?: number
  linkedProducts?: Array<{
    id: string
    name: string
    code: string
  }>
}

// -------- Catálogos --------
export type CatalogLayout = 'grid4' | 'grid6' | 'grid9' | 'list' | 'sheet'
export type CatalogFormat = 'A4-vertical' | 'A4-horizontal' | 'letter'

export interface CatalogConfig {
  layout: CatalogLayout
  format: CatalogFormat
  productsPerPage: number
  showCode: boolean
  showDescription: boolean
  showPrice1: boolean
  showPrices2to6: boolean
  showStock: boolean
  logoOnEachPage: boolean
}

export function defaultPPP(layout: string): number {
  if (layout === 'grid6') return 6
  if (layout === 'grid9') return 9
  if (layout === 'list')  return 15
  if (layout === 'sheet') return 8
  return 4  // grid4
}

export const DEFAULT_CATALOG_CONFIG: CatalogConfig = {
  layout:          'grid4',
  format:          'A4-vertical',
  productsPerPage: 4,
  showCode:        true,
  showDescription: false,
  showPrice1:      true,
  showPrices2to6:  false,
  showStock:       false,
  logoOnEachPage:  true,
}

export interface CatalogProductEntry {
  id:              string
  catalogId:       string
  productId:       string
  position:        number
  imageOverrideId: string | null
  product:         Product
  imageOverride:   ProductImage | null
}

export interface Catalog {
  id:          string
  name:        string
  slug:        string
  description: string | null
  config:      CatalogConfig
  guestVisible: boolean
  pdfUrl:      string | null
  createdBy:   string
  createdAt:   string
  updatedAt:   string
  creator?:    { id: string; username: string; name: string }
  products?:   CatalogProductEntry[]
  _count?:     { products: number }
}

// -------- Trabajos PDF --------
export type PdfJobStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface PdfJob {
  id: string
  catalogId: string
  status: PdfJobStatus
  errorMessage?: string
  requestedBy: string
  startedAt?: string
  completedAt?: string
  createdAt: string
}

// -------- API responses --------
export interface ApiError {
  message: string
  code?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
