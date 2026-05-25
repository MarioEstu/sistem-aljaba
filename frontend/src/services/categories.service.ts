import http from './http'
import type { Category } from '@/types'

export interface CategoryNode extends Category {
  children: CategoryNode[]
  _count:   { products: number }
}

export const categoriesService = {
  tree: () =>
    http.get<CategoryNode[]>('/categories').then((r) => r.data),

  flat: () =>
    http.get<Category[]>('/categories/flat').then((r) => r.data),

  create: (data: { name: string; parentId?: string }) =>
    http.post<Category>('/categories', data).then((r) => r.data),

  update: (id: string, data: { name?: string; parentId?: string | null }) =>
    http.put<Category>(`/categories/${id}`, data).then((r) => r.data),

  delete: (id: string, reassignTo?: string) =>
    http.delete(`/categories/${id}`, { params: reassignTo ? { reassignTo } : {} }).then((r) => r.data),
}
