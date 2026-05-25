import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { pdfJobsService } from '@/services/pdfJobs.service'

export const PDF_JOBS_KEY = 'pdf-jobs'

export function usePdfJobs(catalogId?: string) {
  return useQuery({
    queryKey:        [PDF_JOBS_KEY, catalogId],
    queryFn:         () => pdfJobsService.list(catalogId),
    // Refresca la lista mientras haya jobs activos para que el botón
    // de descarga aparezca sin recargar la página manualmente.
    refetchInterval: (query) => {
      const jobs = query.state.data
      if (!jobs) return false
      const hasActive = jobs.some(
        (j) => j.status === 'pending' || j.status === 'processing',
      )
      return hasActive ? 3000 : false
    },
  })
}

export function usePdfJob(id: string, enabled = true) {
  return useQuery({
    queryKey:        [PDF_JOBS_KEY, id],
    queryFn:         () => pdfJobsService.getById(id),
    enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      // Keep polling while job is pending or processing
      if (status === 'pending' || status === 'processing') return 2000
      return false
    },
  })
}

export function useCreatePdfJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (catalogId: string) => pdfJobsService.create(catalogId),
    onSuccess:  () => qc.invalidateQueries({ queryKey: [PDF_JOBS_KEY] }),
  })
}

export function useRetryPdfJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => pdfJobsService.retry(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: [PDF_JOBS_KEY] }),
  })
}

export function useDeletePdfJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => pdfJobsService.delete(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: [PDF_JOBS_KEY] }),
  })
}
