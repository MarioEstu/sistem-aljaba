import { useParams } from 'react-router-dom'
import { Image as ImageIcon } from 'lucide-react'
import { usePublicCatalog } from '@/hooks/useCatalogs'
import type { CatalogConfig, CatalogProductEntry } from '@/types'
import { DEFAULT_CATALOG_CONFIG } from '@/types'

// ─── Product card ──────────────────────────────────────────────────────────────

function ProductCard({
  entry,
  config,
}: {
  entry:  CatalogProductEntry
  config: CatalogConfig
}) {
  const { product } = entry
  const image = entry.imageOverride ?? product.image

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e4dc',
      borderRadius: 10,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Image */}
      <div style={{
        background: '#f2f1ec',
        height: 180,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {image ? (
          <img
            src={image.url}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <ImageIcon size={36} style={{ color: '#b8b5a9' }} />
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3, color: '#1f1e1a' }}>
          {product.name}
        </div>

        {config.showCode && (
          <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#8c8b83' }}>
            {product.code}
          </div>
        )}

        {config.showDescription && product.description && (
          <div style={{ fontSize: 12, color: '#4a4944', lineHeight: 1.4, marginTop: 2 }}>
            {product.description.length > 80
              ? product.description.slice(0, 80) + '…'
              : product.description}
          </div>
        )}

        <div style={{ marginTop: 'auto', paddingTop: 8 }}>
          {config.showPrice1 && product.price1 != null && (
            <div style={{ fontWeight: 700, fontSize: 16, color: '#c4452c' }}>
              Q {Number(product.price1).toFixed(2)}
            </div>
          )}

          {config.showPrices2to6 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
              {([2, 3, 4, 5, 6] as const).map((n) => {
                const v = product[`price${n}` as keyof typeof product] as number | undefined
                if (v == null) return null
                return (
                  <span key={n} style={{ fontSize: 11, color: '#6b6a63' }}>
                    P{n}: Q {Number(v).toFixed(2)}
                  </span>
                )
              })}
            </div>
          )}

          {config.showStock && product.stock != null && (
            <div style={{ fontSize: 11, color: '#6b6a63', marginTop: 2 }}>
              Stock: {product.stock}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main view ─────────────────────────────────────────────────────────────────

export default function CatalogViewPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { data: catalog, isLoading, isError } = usePublicCatalog(slug)

  const config = (catalog?.config as CatalogConfig | null) ?? DEFAULT_CATALOG_CONFIG

  const cols =
    config.layout === 'grid9' ? 3
    : config.layout === 'grid6' ? 3
    : config.layout === 'list'  ? 1
    : 2  // grid4, sheet, default

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafaf7' }}>
        <p style={{ color: '#8c8b83', fontFamily: 'sans-serif' }}>Cargando catálogo…</p>
      </div>
    )
  }

  if (isError || !catalog) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fafaf7', gap: 12, fontFamily: 'sans-serif' }}>
        <div style={{ width: 4, height: 32, background: '#c4452c', borderRadius: 2 }} />
        <p style={{ color: '#1f1e1a', fontWeight: 700, fontSize: 20, margin: 0 }}>Catálogo no disponible</p>
        <p style={{ color: '#8c8b83', margin: 0 }}>
          Este catálogo no existe o no está publicado actualmente.
        </p>
      </div>
    )
  }

  const entries = catalog.products ?? []

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf7', fontFamily: '"Inter", system-ui, sans-serif' }}>
      {/* Header */}
      <header style={{
        background: '#fff',
        borderBottom: '1px solid #e5e4dc',
        padding: '0 32px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 4, height: 22, background: '#c4452c', borderRadius: 2 }} />
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.01em', color: '#1f1e1a' }}>
            ALJABA
          </span>
          <span style={{ fontSize: 11, color: '#8c8b83', letterSpacing: '0.08em', fontWeight: 500 }}>
            CATÁLOGO
          </span>
        </div>
        <span style={{ fontSize: 11, color: '#b8b5a9', fontFamily: 'monospace' }}>
          {catalog.slug}
        </span>
      </header>

      {/* Catalog info */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 16px' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 700, color: '#1f1e1a' }}>
          {catalog.name}
        </h1>
        {catalog.description && (
          <p style={{ margin: '0 0 8px', color: '#4a4944', fontSize: 14 }}>
            {catalog.description}
          </p>
        )}
        <p style={{ margin: 0, fontSize: 12, color: '#8c8b83' }}>
          {entries.length} producto{entries.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Product grid */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '8px 24px 48px' }}>
        {entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, color: '#8c8b83' }}>
            <ImageIcon size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p style={{ margin: 0, fontWeight: 600 }}>Este catálogo aún no tiene productos.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: 16,
          }}>
            {entries.map((entry) => (
              <ProductCard key={entry.id} entry={entry} config={config} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '16px 24px', borderTop: '1px solid #e5e4dc', color: '#b8b5a9', fontSize: 11 }}>
        Aljaba S.A. · Catálogo digital
      </footer>
    </div>
  )
}
