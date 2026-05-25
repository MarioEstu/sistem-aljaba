import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Download,
  ExternalLink,
  FileText,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import {
  useDeletePdfJob,
  usePdfJob,
  usePdfJobs,
  useRetryPdfJob,
} from '@/hooks/usePdfJobs'
import type { PdfJobStatus } from '@/types'
import type { PdfJobDetail } from '@/services/pdfJobs.service'
import ConfirmModal from '@/components/ui/ConfirmModal'

// ── Status helpers ────────────────────────────────────────────────────────────

function statusLabel(s: PdfJobStatus): string {
  if (s === 'pending')    return 'En cola'
  if (s === 'processing') return 'Generando…'
  if (s === 'completed')  return 'Listo'
  return 'Fallido'
}

function statusPill(s: PdfJobStatus) {
  const map: Record<PdfJobStatus, string> = {
    pending:    'warn',
    processing: 'info',
    completed:  'ok',
    failed:     'err',
  }
  return map[s] ?? 'dim'
}

function elapsed(startedAt?: string | null, completedAt?: string | null): string {
  if (!startedAt) return '—'
  const end = completedAt ? new Date(completedAt) : new Date()
  const ms  = end.getTime() - new Date(startedAt).getTime()
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function formatDate(iso?: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-GT', {
    day:    '2-digit',
    month:  '2-digit',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  })
}

// ── Active job row (with live polling) ───────────────────────────────────────

function ActiveJobRow({
  jobId,
  onDelete,
}: {
  jobId:    string
  onDelete: (id: string) => void
}) {
  const { data: job } = usePdfJob(jobId, true)
  if (!job) return null
  return <JobRow job={job} onDelete={onDelete} />
}

// ── Job row ───────────────────────────────────────────────────────────────────


function JobRow({
  job,
  onDelete,
}: {
  job:      PdfJobDetail
  onDelete: (id: string) => void
}) {
  const retry     = useRetryPdfJob()
  const isLive    = job.status === 'pending' || job.status === 'processing'
  const pdfUrl    = job.catalog?.pdfUrl

  return (
    <tr>
      <td>
        <div style={{ fontWeight: 600 }}>{job.catalog?.name ?? '—'}</div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--fg-subtle)' }}>
          {job.catalog?.slug}
        </div>
      </td>
      <td>
        <span className={`pill ${statusPill(job.status)}`}>
          {statusLabel(job.status)}
          {isLive && (
            <span style={{ display: 'inline-block', marginLeft: 5, animation: 'spin 1s linear infinite' }}>⟳</span>
          )}
        </span>
      </td>
      <td>{formatDate(job.createdAt)}</td>
      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
        {elapsed(job.startedAt, job.completedAt)}
      </td>
      <td>
        {job.status === 'failed' && job.errorMessage && (
          <span style={{ fontSize: 11, color: 'var(--danger)' }}>{job.errorMessage}</span>
        )}
        {job.status === 'completed' && pdfUrl && (
          <a
            className="btn primary sm"
            aria-label="descargar"
            href={pdfUrl}
            download={`catalogo-${job.catalog?.slug ?? job.id}.pdf`}
          >
            <Download size={12} /> Descargar
          </a>
        )}
      </td>
      <td>
        <div style={{ display: 'flex', gap: 6 }}>
          {job.status === 'failed' && (
            <button
              className="btn secondary sm"
              disabled={retry.isPending}
              onClick={() => retry.mutate(job.id)}
            >
              <RefreshCw size={12} /> Reintentar
            </button>
          )}
          <button
            className="btn ghost sm"
            style={{ color: 'var(--danger)' }}
            disabled={isLive}
            title={isLive ? 'No se puede eliminar mientras está en proceso' : 'Eliminar'}
            onClick={() => onDelete(job.id)}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PdfJobsPage() {
  const navigate = useNavigate()
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [catalogFilter, setCatalogFilter] = useState('')

  const { data: jobs = [], isLoading } = usePdfJobs()
  const deleteJob  = useDeletePdfJob()

  const filtered = catalogFilter
    ? jobs.filter(
        (j) =>
          j.catalog?.name?.toLowerCase().includes(catalogFilter.toLowerCase()) ||
          j.catalog?.slug?.toLowerCase().includes(catalogFilter.toLowerCase()),
      )
    : jobs

  const pending    = jobs.filter((j) => j.status === 'pending' || j.status === 'processing').length
  const completed  = jobs.filter((j) => j.status === 'completed').length
  const failed     = jobs.filter((j) => j.status === 'failed').length

  // Jobs that need live polling
  const liveJobIds = jobs
    .filter((j) => j.status === 'pending' || j.status === 'processing')
    .map((j) => j.id)

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="crumbs">Admin · Trabajos PDF</div>
          <h1>Generación de PDF</h1>
          <p className="desc">
            {isLoading ? 'Cargando…' : `${jobs.length} trabajos · ${pending} en proceso · ${completed} completados · ${failed} fallidos`}
          </p>
        </div>
        <button
          className="btn secondary"
          onClick={() => navigate('/catalogs')}
        >
          <ExternalLink size={14} /> Ir a catálogos
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total',      value: jobs.length,  color: 'var(--fg)' },
          { label: 'En proceso', value: pending,       color: 'var(--warn)' },
          { label: 'Listos',     value: completed,     color: 'var(--ok)' },
          { label: 'Fallidos',   value: failed,        color: 'var(--danger)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card card-pad" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
            <div className="p-sm">{label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div className="field" style={{ maxWidth: 360 }}>
          <label>Filtrar por catálogo</label>
          <input
            className="input"
            placeholder="Nombre o slug del catálogo…"
            value={catalogFilter}
            onChange={(e) => setCatalogFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      {!isLoading && filtered.length === 0 ? (
        <div className="card dashed card-pad" style={{ textAlign: 'center', padding: 48 }}>
          <FileText size={28} style={{ color: 'var(--fg-subtle)', marginBottom: 8 }} />
          <p style={{ margin: 0, fontWeight: 600 }}>
            {catalogFilter ? 'Sin resultados para ese filtro' : 'No hay trabajos de PDF aún'}
          </p>
          <p className="p-sm" style={{ margin: '8px 0 0' }}>
            Genera un PDF desde el constructor de catálogos o desde la lista de catálogos.
          </p>
          <button className="btn primary" style={{ marginTop: 16 }} onClick={() => navigate('/catalogs')}>
            Ir a catálogos
          </button>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'auto' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Catálogo</th>
                <th>Estado</th>
                <th>Solicitado</th>
                <th>Tiempo</th>
                <th>Resultado</th>
                <th style={{ width: 160 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((job) =>
                liveJobIds.includes(job.id) ? (
                  <ActiveJobRow key={job.id} jobId={job.id} onDelete={setDeleteTarget} />
                ) : (
                  <JobRow key={job.id} job={job} onDelete={setDeleteTarget} />
                ),
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm delete */}
      {deleteTarget && (
        <ConfirmModal
          title="Eliminar trabajo"
          message="¿Eliminar este trabajo? Se eliminará también el archivo PDF descargable."
          loading={deleteJob.isPending}
          onConfirm={async () => {
            await deleteJob.mutateAsync(deleteTarget)
            setDeleteTarget(null)
          }}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .pill.info { background: #dbeafe; color: #1d4ed8; }
      `}</style>
    </div>
  )
}
