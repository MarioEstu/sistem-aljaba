import http from './http'
import type { Product, PaginatedResponse } from '@/types'

export interface ProductsQuery {
  search?:     string
  categoryId?: string
  page?:       number
  limit?:      number
  orderBy?:    string
  order?:      'asc' | 'desc'
  noImage?:    boolean
}

export interface BulkAction {
  action:      'changeCategory' | 'applyDiscount' | 'updateStock' | 'delete'
  ids:         string[]
  categoryId?: string | null
  percent?:    number
  stock?:      number
}

export interface CsvPreviewResult {
  rows:         CsvRowResult[]
  totalRows:    number
  okCount:      number
  errorCount:   number
  warningCount: number
  dupCount:     number
}

export interface CsvRowResult {
  line:        number
  name:        string
  code:        string
  description: string
  category:    string
  price1:      number | null
  price2:      number | null
  price3:      number | null
  price4:      number | null
  price5:      number | null
  price6:      number | null
  stock:       number | null
  status:      'ok' | 'error' | 'warning' | 'duplicate'
  errors:      string[]
  warnings:    string[]
  imageFound:  boolean
  existsInDb:  boolean
}

export const productsService = {
  list: (params: ProductsQuery) =>
    http.get<PaginatedResponse<Product>>('/products', { params }).then((r) => r.data),

  getById: (id: string) =>
    http.get<Product>(`/products/${id}`).then((r) => r.data),

  create: (data: Partial<Product>) =>
    http.post<Product>('/products', data).then((r) => r.data),

  update: (id: string, data: Partial<Product>) =>
    http.put<Product>(`/products/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    http.delete(`/products/${id}`).then((r) => r.data),

  bulkAction: (action: BulkAction) =>
    http.post('/products/bulk', action).then((r) => r.data),

  csvPreview: (file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    return http.post<CsvPreviewResult>('/products/csv/preview', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },

  csvImport: (rows: CsvRowResult[], overwriteDuplicates: boolean) =>
    http.post<{ imported: number; skipped: number; errors: number }>(
      '/products/csv/import',
      { rows, overwriteDuplicates },
    ).then((r) => r.data),
}
