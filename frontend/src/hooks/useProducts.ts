import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsService, type ProductsQuery } from '@/services/products.service'
import type { Product } from '@/types'

export const PRODUCTS_KEY = 'products'

export function useProducts(params: ProductsQuery) {
  return useQuery({
    queryKey: [PRODUCTS_KEY, params],
    queryFn:  () => productsService.list(params),
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: [PRODUCTS_KEY, id],
    queryFn:  () => productsService.getById(id),
    enabled:  !!id,
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Product>) => productsService.create(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: [PRODUCTS_KEY] }),
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      productsService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PRODUCTS_KEY] }),
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => productsService.delete(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: [PRODUCTS_KEY] }),
  })
}
