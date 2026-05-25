import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { imagesService, type ImagesQuery } from '@/services/images.service'

export const IMAGES_KEY = 'images'

export function useImages(params: ImagesQuery) {
  return useQuery({
    queryKey: [IMAGES_KEY, params],
    queryFn: () => imagesService.list(params),
  })
}

export function useUploadImages() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (files: File[]) => imagesService.upload(files),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [IMAGES_KEY] })
      qc.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useOverwriteImage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => imagesService.overwrite(id, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [IMAGES_KEY] })
      qc.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useDeleteImage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => imagesService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [IMAGES_KEY] })
      qc.invalidateQueries({ queryKey: ['products'] })
    },
  })
}