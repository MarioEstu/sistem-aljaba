import http from './http'
import type { PaginatedResponse, ProductImage } from '@/types'

export interface LinkedProductSummary {
  id: string
  name: string
  code: string
}

export interface GalleryImage extends ProductImage {
  baseName: string
  usageCount: number
  linkedProducts: LinkedProductSummary[]
}

export interface ImagesQuery {
  search?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
  unlinkedOnly?: boolean
}

export interface UploadImageResult {
  overwritten: boolean
  autoLinkedProducts: number
  image: GalleryImage
}

export const imagesService = {
  list: (params: ImagesQuery) =>
    http.get<PaginatedResponse<GalleryImage>>('/images', { params }).then((r) => r.data),

  upload: (files: File[]) => {
    const fd = new FormData()
    files.forEach((file) => fd.append('files', file))
    return http.post<{ uploaded: UploadImageResult[] }>('/images/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },

  overwrite: (id: string, file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    return http.put<GalleryImage>(`/images/${id}/edit`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },

  delete: (id: string) =>
    http.delete<{ message: string; unlinkedProducts: number }>(`/images/${id}`).then((r) => r.data),
}