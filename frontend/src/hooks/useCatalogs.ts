import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { catalogsService, type CatalogInput } from '@/services/catalogs.service'
import type { Catalog } from '@/types'

export const CATALOGS_KEY = 'catalogs'

export function useCatalogs() {
  return useQuery({
    queryKey: [CATALOGS_KEY],
    queryFn:  catalogsService.list,
  })
}

export function useCatalog(id: string) {
  return useQuery({
    queryKey: [CATALOGS_KEY, id],
    queryFn:  () => catalogsService.getById(id),
    enabled:  !!id,
  })
}

export function usePublicCatalog(slug: string) {
  return useQuery({
    queryKey: ['catalog-public', slug],
    queryFn:  () => catalogsService.getPublic(slug),
    enabled:  !!slug,
    retry:    false,
  })
}

export function useCreateCatalog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CatalogInput) => catalogsService.create(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: [CATALOGS_KEY] }),
  })
}

export function useUpdateCatalog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CatalogInput> }) =>
      catalogsService.update(id, data),
    onSuccess: (catalog: Catalog) => {
      qc.invalidateQueries({ queryKey: [CATALOGS_KEY] })
      qc.setQueryData([CATALOGS_KEY, catalog.id], catalog)
    },
  })
}

export function useDeleteCatalog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => catalogsService.delete(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: [CATALOGS_KEY] }),
  })
}

export function useAddProductsToCatalog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ catalogId, productIds }: { catalogId: string; productIds: string[] }) =>
      catalogsService.addProducts(catalogId, productIds),
    onSuccess: (catalog: Catalog) => {
      qc.invalidateQueries({ queryKey: [CATALOGS_KEY] })
      qc.setQueryData([CATALOGS_KEY, catalog.id], catalog)
    },
  })
}

export function useRemoveProductFromCatalog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ catalogId, productId }: { catalogId: string; productId: string }) =>
      catalogsService.removeProduct(catalogId, productId),
    onSuccess: (_: unknown, vars: { catalogId: string; productId: string }) => {
      qc.invalidateQueries({ queryKey: [CATALOGS_KEY, vars.catalogId] })
    },
  })
}

export function useReorderCatalogProducts() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      catalogId,
      items,
    }: {
      catalogId: string
      items: Array<{ productId: string; position: number }>
    }) => catalogsService.reorderProducts(catalogId, items),
    onSuccess: (_: unknown, vars: { catalogId: string; items: Array<{ productId: string; position: number }> }) => {
      qc.invalidateQueries({ queryKey: [CATALOGS_KEY, vars.catalogId] })
    },
  })
}

export function useSetCatalogProductImageOverride() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      catalogId,
      productId,
      imageOverrideId,
    }: {
      catalogId:       string
      productId:       string
      imageOverrideId: string | null
    }) => catalogsService.setProductImageOverride(catalogId, productId, imageOverrideId),
    onSuccess: (_: unknown, vars: { catalogId: string; productId: string; imageOverrideId: string | null }) => {
      qc.invalidateQueries({ queryKey: [CATALOGS_KEY, vars.catalogId] })
    },
  })
}

export function usePublishCatalog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => catalogsService.publish(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: [CATALOGS_KEY] }),
  })
}

export function useUnpublishCatalog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => catalogsService.unpublish(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: [CATALOGS_KEY] }),
  })
}
