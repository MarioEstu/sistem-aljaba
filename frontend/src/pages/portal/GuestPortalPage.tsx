import { useQuery } from '@tanstack/react-query'
import { BookOpen, Download, Eye, Package } from 'lucide-react'
import { catalogsService } from '@/services/catalogs.service'
import { useAuthStore } from '@/store/auth.store'
import type { Catalog } from '@/types'

function CatalogCard({ catalog }: { catalog: Catalog }) {
  const productCount = catalog._count?.products ?? 0

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'box-shadow 0.15s',
      }}
    >
      {/* Header strip */}
      <div
        style={{
          background: 'var(--accent)',
          height: 6,
          borderRadius: 'var(--r-lg) var(--r-lg) 0 0',
        }}
      />

      <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Name */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <BookOpen size={18} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
          <div>
            <h3 style={{ margin: 0, fontSize: 'var(--fs-md)', fontWeight: 700, lineHeight: 1.3 }}>
              {catalog.name}
            </h3>
            {catalog.description && (
              <p
                className="p-sm"
                style={{
                  margin: '4px 0 0',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {catalog.description}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 'var(--fs-xs)',
            color: 'var(--fg-subtle)',
            marginTop: 'auto',
          }}
        >
          <Package size={12} />
          <span>{productCount} producto{productCount !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Actions */}
      <div
        style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border-soft)',
          display: 'flex',
          gap: 8,
        }}
      >
        <a
          href={`/view/${catalog.slug}`}
          target="_blank"
          rel="noreferrer"
          className="btn secondary sm"
          style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, justifyContent: 'center', textDecoration: 'none' }}
        >
          <Eye size={13} /> Ver
        </a>
        {catalog.pdfUrl ? (
          <a
            href={catalog.pdfUrl}
            download
            className="btn primary sm"
            style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, justifyContent: 'center', textDecoration: 'none' }}
            aria-label="descargar pdf"
          >
            <Download size={13} /> PDF
          </a>
        ) : (
          <button
            className="btn sm"
            disabled
            style={{ flex: 1, opacity: 0.4 }}
            title="PDF no disponible aún"
          >
            <Download size={13} /> PDF
          </button>
        )}
      </div>
    </div>
  )
}

export default function GuestPortalPage() {
  const { user } = useAuthStore()

  const { data: catalogs = [], isLoading, isError } = useQuery({
    queryKey: ['catalogs', 'guest'],
    queryFn:  () => catalogsService.listForGuest(),
  })

  const firstName = user?.name?.split(' ')[0] ?? user?.username ?? 'Usuario'

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 'var(--fs-2xl)', fontWeight: 700 }}>
          Hola, {firstName}
        </h1>
        <p className="desc" style={{ margin: 0 }}>
          Aquí están los catálogos disponibles para ti. Puedes verlos en línea o descargar el PDF.
        </p>
      </div>

      {/* Content */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--fg-subtle)' }}>
          Cargando catálogos…
        </div>
      )}

      {isError && (
        <div className="card card-pad" style={{ color: 'var(--danger)', textAlign: 'center' }}>
          No se pudieron cargar los catálogos. Intenta recargar la página.
        </div>
      )}

      {!isLoading && !isError && catalogs.length === 0 && (
        <div
          className="card dashed card-pad"
          style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--fg-subtle)' }}
        >
          <BookOpen size={32} style={{ margin: '0 auto 12px', opacity: 0.4, display: 'block' }} />
          <p style={{ margin: 0, fontWeight: 600, fontSize: 'var(--fs-md)' }}>
            Sin catálogos disponibles
          </p>
          <p className="p-sm" style={{ margin: '6px 0 0' }}>
            El administrador aún no ha habilitado ningún catálogo para visualización.
          </p>
        </div>
      )}

      {!isLoading && !isError && catalogs.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 16,
          }}
        >
          {catalogs.map((c) => (
            <CatalogCard key={c.id} catalog={c} />
          ))}
        </div>
      )}
    </div>
  )
}
