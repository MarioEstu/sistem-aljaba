import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Package, Image, BookOpen, FileText,
  Upload, Plus, ArrowRight, AlertTriangle, ImageOff,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useProducts } from '@/hooks/useProducts'
import { useImages } from '@/hooks/useImages'
import { useCatalogs } from '@/hooks/useCatalogs'
import { usePdfJobs } from '@/hooks/usePdfJobs'
import CsvImportModal from '@/pages/products/CsvImportModal'
import CatalogFormModal from '@/components/ui/CatalogFormModal'

// ─── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label, value, hint, icon, iconVariant = 'default', progress, onClick,
}: {
  label: string
  value: number | string
  hint: string
  icon: React.ReactNode
  iconVariant?: 'default' | 'accent' | 'warn' | 'ok'
  progress?: number
  onClick?: () => void
}) {
  return (
    <div
      className="stat-card"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="stat-card-header">
        <div><span className="eyebrow">{label}</span></div>
        <div className={`stat-icon-wrap ${iconVariant}`}>{icon}</div>
      </div>
      <div
        className="stat-value"
        style={{ color: iconVariant === 'warn' ? 'var(--warn)' : undefined }}
      >
        {value}
      </div>
      <div
        className="stat-hint"
        style={{ color: iconVariant === 'warn' ? 'var(--warn)' : undefined }}
      >
        {hint}
      </div>
      {progress !== undefined && (
        <div className="stat-progress">
          <div className="stat-progress-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
      )}
    </div>
  )
}

// ─── Quick link ─────────────────────────────────────────────────────────────────

function QuickLink({
  icon, label, description, iconVariant = 'muted', onClick,
}: {
  icon: React.ReactNode
  label: string
  description: string
  iconVariant?: 'red' | 'green' | 'warm' | 'muted'
  onClick: () => void
}) {
  return (
    <button className="ql-item" onClick={onClick}>
      <div className={`ql-icon ${iconVariant}`}>{icon}</div>
      <span style={{ flex: 1 }}>
        <span className="ql-label">{label}</span>
        <span className="ql-desc">{description}</span>
      </span>
      <ArrowRight size={14} className="ql-arrow" />
    </button>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user }   = useAuthStore()
  const navigate   = useNavigate()
  const hour       = new Date().getHours()
  const greeting   = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'
  const firstName  = user?.name?.split(' ')[0] ?? 'Admin'

  const [showCsvModal,     setShowCsvModal]     = useState(false)
  const [showCatalogModal, setShowCatalogModal] = useState(false)

  // ── Datos reales desde la API ──
  const { data: prodData }      = useProducts({ page: 1, limit: 1 })
  const { data: noImgData }     = useProducts({ page: 1, limit: 1, noImage: true })
  const { data: imgData }       = useImages({ page: 1, limit: 1 })
  const { data: catalogs = [] } = useCatalogs()
  const { data: pdfJobs = [] }  = usePdfJobs()

  const totalProducts      = prodData?.total  ?? 0
  const totalImages        = imgData?.total   ?? 0
  const totalCatalogs      = catalogs.length
  const totalPdfJobs       = pdfJobs.length
  const activePdfJobs      = pdfJobs.filter(j => j.status === 'pending' || j.status === 'processing').length
  const completedPdfJobs   = pdfJobs.filter(j => j.status === 'completed').length
  const productsWithoutImg = noImgData?.total ?? 0
  const publishedCatalogs  = catalogs.filter(c => c.guestVisible).length

  const imgProgress = totalProducts > 0
    ? Math.round(((totalProducts - productsWithoutImg) / totalProducts) * 100)
    : 0

  const stats = [
    {
      label:       'Productos',
      value:       totalProducts === 0 ? '—' : totalProducts.toLocaleString('es-GT'),
      hint:        totalProducts === 0
        ? 'sin productos aún'
        : `${(totalProducts - productsWithoutImg).toLocaleString('es-GT')} con imagen (${imgProgress}%)`,
      icon:        <Package size={18} />,
      iconVariant: 'accent' as const,
      progress:    totalProducts > 0 ? imgProgress : undefined,
      onClick:     () => navigate('/products'),
    },
    {
      label:       'Imágenes',
      value:       totalImages === 0 ? '—' : totalImages.toLocaleString('es-GT'),
      hint:        totalImages === 0 ? 'sin imágenes aún' : 'archivos en el sistema',
      icon:        <Image size={18} />,
      iconVariant: 'ok' as const,
      onClick:     () => navigate('/images'),
    },
    {
      label:       'Catálogos',
      value:       totalCatalogs === 0 ? '—' : totalCatalogs,
      hint:        totalCatalogs === 0
        ? 'sin catálogos creados'
        : `${publishedCatalogs} publicado${publishedCatalogs !== 1 ? 's' : ''}`,
      icon:        <BookOpen size={18} />,
      iconVariant: 'accent' as const,
      progress:    totalCatalogs > 0 ? Math.round((publishedCatalogs / totalCatalogs) * 100) : undefined,
      onClick:     () => navigate('/catalogs'),
    },
    {
      label:       'Trabajos PDF',
      // Muestra el total histórico; la alerta ámbar solo aparece si hay trabajos activos
      value:       totalPdfJobs === 0 ? '—' : totalPdfJobs,
      hint:        totalPdfJobs === 0
        ? 'sin PDFs generados'
        : activePdfJobs > 0
          ? `${activePdfJobs} en proceso ahora`
          : `${completedPdfJobs} completado${completedPdfJobs !== 1 ? 's' : ''}`,
      icon:        <FileText size={18} />,
      iconVariant: activePdfJobs > 0 ? 'warn' as const : 'default' as const,
      onClick:     () => navigate('/pdf-jobs'),
    },
  ]

  // ── Alertas de pendientes ──
  const pendingAlerts: { key: string; message: string; action: string; onClick: () => void }[] = []
  if (productsWithoutImg > 0 && totalProducts > 0) {
    pendingAlerts.push({
      key:     'no-img',
      message: `${productsWithoutImg.toLocaleString('es-GT')} producto${productsWithoutImg !== 1 ? 's' : ''} sin imagen asignada`,
      action:  'Subir imágenes',
      onClick: () => navigate('/images'),
    })
  }
  if (totalCatalogs === 0 && totalProducts > 0) {
    pendingAlerts.push({
      key:     'no-catalog',
      message: 'No hay catálogos creados todavía',
      action:  'Crear catálogo',
      onClick: () => setShowCatalogModal(true),
    })
  }

  return (
    <div className="page">
      {/* ── Hero banner ── */}
      <div className="hero-banner" style={{ marginBottom: 24 }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-greeting">{greeting}</div>
          <h1 className="hero-title">{firstName}</h1>
          <p className="hero-subtitle">Bienvenido a Catalog Aljaba</p>
        </div>
        <div className="hero-actions">
          <button className="btn hero" onClick={() => setShowCsvModal(true)}>
            <Upload size={14} /> Importar CSV
          </button>
          <button className="btn hero accent" onClick={() => setShowCatalogModal(true)}>
            <Plus size={14} /> Nuevo catálogo
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="stats-grid">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* ── Alertas de pendientes ── */}
      {pendingAlerts.length > 0 && (
        <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {pendingAlerts.map((alert) => (
            <div key={alert.key} className="pending-alert">
              <AlertTriangle size={16} style={{ color: 'var(--warn)', flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 'var(--fs-sm)' }}>{alert.message}</span>
              <button className="btn secondary sm" onClick={alert.onClick}>
                {alert.action} <ArrowRight size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Accesos rápidos ── */}
      <div style={{ marginBottom: 8 }}>
        <span className="eyebrow" style={{ marginBottom: 12, display: 'block' }}>Accesos rápidos</span>
        <div className="ql-grid">
          <QuickLink
            icon={<Upload size={16} />}
            label="Subir imágenes"
            description="Carga y vincula por código de producto"
            iconVariant="red"
            onClick={() => navigate('/images')}
          />
          <QuickLink
            icon={<Package size={16} />}
            label="Ver productos"
            description={
              totalProducts > 0
                ? `${totalProducts.toLocaleString('es-GT')} productos en el sistema`
                : 'Administra el catálogo de artículos'
            }
            iconVariant="muted"
            onClick={() => navigate('/products')}
          />
          <QuickLink
            icon={<BookOpen size={16} />}
            label="Gestionar catálogos"
            description="Construye y publica para vendedores"
            iconVariant="green"
            onClick={() => navigate('/catalogs')}
          />
          <QuickLink
            icon={<ImageOff size={16} />}
            label="Productos sin imagen"
            description={
              productsWithoutImg > 0
                ? `${productsWithoutImg.toLocaleString('es-GT')} pendientes de imagen`
                : 'Todos los productos tienen imagen ✓'
            }
            iconVariant={productsWithoutImg > 0 ? 'warm' : 'green'}
            onClick={() => navigate('/products?noImage=true')}
          />
        </div>
      </div>

      {/* Modales */}
      {showCsvModal     && <CsvImportModal onClose={() => setShowCsvModal(false)} />}
      {showCatalogModal && (
        <CatalogFormModal
          onClose={() => setShowCatalogModal(false)}
          onCreated={() => navigate('/catalogs')}
        />
      )}
    </div>
  )
}
