import http from './http'
import type { PdfJob, PdfJobStatus } from '@/types'

export interface PdfJobDetail extends PdfJob {
  catalog:   { id: string; name: string; slug: string; pdfUrl: string | null }
  requester: { id: string; username: string; name: string }
}

export const pdfJobsService = {
  list: (catalogId?: string) =>
    http
      .get<PdfJobDetail[]>('/pdf-jobs', { params: catalogId ? { catalogId } : {} })
      .then((r) => r.data),

  getById: (id: string) =>
    http.get<PdfJobDetail>(`/pdf-jobs/${id}`).then((r) => r.data),

  create: (catalogId: string) =>
    http.post<PdfJob>('/pdf-jobs', { catalogId }).then((r) => r.data),

  retry: (id: string) =>
    http.post<PdfJob>(`/pdf-jobs/${id}/retry`).then((r) => r.data),

  delete: (id: string) =>
    http.delete<{ deleted: boolean; jobId: string; status: PdfJobStatus }>(`/pdf-jobs/${id}`).then((r) => r.data),
}
