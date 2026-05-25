import http from './http'
import axios from 'axios'
import type { Catalog } from '@/types'

// Axios instance for public endpoints (no auth header, no 401 redirect)
const publicHttp = axios.create({ baseURL: '/api', timeout: 15000 })

export interface CatalogInput {
  name:        string
  description?: string | null
  config?:     Record<string, unknown>
}

export const catalogsService = {
  list: () =>
    http.get<Catalog[]>('/catalogs').then((r) => r.data),

  listForGuest: () =>
    http.get<Catalog[]>('/catalogs/guest').then((r) => r.data),

  getById: (id: string) =>
    http.get<Catalog>(`/catalogs/${id}`).then((r) => r.data),

  getPublic: (slug: string) =>
    publicHttp.get<Catalog>(`/catalogs/public/${slug}`).then((r) => r.data),

  create: (data: CatalogInput) =>
    http.post<Catalog>('/catalogs', data).then((r) => r.data),

  update: (id: string, data: Partial<CatalogInput>) =>
    http.put<Catalog>(`/catalogs/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    http.delete(`/catalogs/${id}`).then((r) => r.data),

  addProducts: (catalogId: string, productIds: string[]) =>
    http.post<Catalog>(`/catalogs/${catalogId}/products`, { productIds }).then((r) => r.data),

  removeProduct: (catalogId: string, productId: string) =>
    http.delete(`/catalogs/${catalogId}/products/${productId}`).then((r) => r.data),

  reorderProducts: (
    catalogId: string,
    items: Array<{ productId: string; position: number }>,
  ) =>
    http.put(`/catalogs/${catalogId}/products/reorder`, { items }).then((r) => r.data),

  setProductImageOverride: (
    catalogId: string,
    productId: string,
    imageOverrideId: string | null,
  ) =>
    http
      .put(`/catalogs/${catalogId}/products/${productId}/image`, { imageOverrideId })
      .then((r) => r.data),

  publish: (id: string) =>
    http.put<Catalog>(`/catalogs/${id}/publish`).then((r) => r.data),

  unpublish: (id: string) =>
    http.put<Catalog>(`/catalogs/${id}/unpublish`).then((r) => r.data),
}
