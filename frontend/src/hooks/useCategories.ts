import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoriesService } from '@/services/categories.service'

export const CATEGORIES_KEY = 'categories'

export function useCategoriesTree() {
  return useQuery({
    queryKey: [CATEGORIES_KEY, 'tree'],
    queryFn:  categoriesService.tree,
  })
}

export function useCategoriesFlat() {
  return useQuery({
    queryKey: [CATEGORIES_KEY, 'flat'],
    queryFn:  categoriesService.flat,
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; parentId?: string }) =>
      categoriesService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CATEGORIES_KEY] }),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; parentId?: string | null } }) =>
      categoriesService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CATEGORIES_KEY] }),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reassignTo }: { id: string; reassignTo?: string }) =>
      categoriesService.delete(id, reassignTo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CATEGORIES_KEY] })
      qc.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
