import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Eye, EyeOff, Search, Plus, X, GripVertical,
  Image as ImageIcon, ExternalLink, Settings, ChevronDown, ChevronUp, FileDown,
} from 'lucide-react'
import {
  useCatalog, useAddProductsToCatalog, useRemoveProductFromCatalog,
  useReorderCatalogProducts, useSetCatalogProductImageOverride,
  usePublishCatalog, useUnpublishCatalog, useUpdateCatalog,
} from '@/hooks/useCatalogs'
import { useProducts } from '@/hooks/useProducts'
import { productsService } from '@/services/products.service'
import { useImages } from '@/hooks/useImages'
import { useCategoriesFlat } from '@/hooks/useCategories'
import { useCreatePdfJob } from '@/hooks/usePdfJobs'
import type { CatalogProductEntry, Product, CatalogConfig } from '@/types'
import { DEFAULT_CATALOG_CONFIG } from '@/types'

// ─── Helpers ───────────────────────────────────────────────────────────────────

function priceLabel(p?: number | null) {
  if (p == null) return '—'
  return `Q ${Number(p).toFixed(2)}`
}

function ProductThumb({ url, size = 40 }: { url?: string | null; size?: number }) {
  return (
    <div
      className="ph"
      style={{ width: size, height: size, borderRadius: 6, flexShrink: 0 }}
    >
      {url ? (
        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <ImageIcon size={size * 0.4} />
      )}
    </div>
  )
}

// ─── Config panel ──────────────────────────────────────────────────────────────

function ConfigPanel({
  config,
  onChange,
}: {
  config: CatalogConfig
  onChange: (key: keyof CatalogConfig, value: unknown) => void
}) {
  const layouts  = ['grid4', 'grid6', 'grid9', 'list', 'sheet'] as const
  const formats  = ['A4-vertical', 'A4-horizontal', 'letter'] as const
  const toggle   = (key: keyof CatalogConfig) => onChange(key, !config[key])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className="field">
          <label>Diseño</label>
          <select
            className="input"
            value={config.layout}
            onChange={(e) => onChange('layout', e.target.value)}
          >
            {layouts.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Formato</label>
          <select
            className="input"
            value={config.format}
            onChange={(e) => onChange('format', e.target.value)}
          >
            {formats.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
      </div>
      <div className="field">
        <label>Productos por página</label>
        <input
          type="number" min={1} max={50} className="input mono"
          value={config.productsPerPage}
          onChange={(e) => onChange('productsPerPage', parseInt(e.target.value, 10) || 12)}
        />
      </div>
      {(
        [
          ['showCode',        'Mostrar código'],
          ['showDescription', 'Mostrar descripción'],
          ['showPrice1',      'Mostrar Precio 1'],
          ['showPrices2to6',  'Mostrar Precios 2–6'],
          ['showStock',       'Mostrar stock'],
          ['logoOnEachPage',  'Logo en cada página'],
        ] as Array<[keyof CatalogConfig, string]>
      ).map(([key, label]) => (
        <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={Boolean(config[key])}
            onChange={() => toggle(key)}
          />
          <span style={{ fontSize: 'var(--fs-sm)' }}>{label}</span>
        </label>
      ))}
    </div>
  )
}

// ─── Catalog product row (draggable) ──────────────────────────────────────────

function CatalogProductRow({
  entry,
  images,
  onRemove,
  onImageOverride,
  dragHandleProps,
}: {
  entry:           CatalogProductEntry
  images:          Array<{ id: string; filename: string; thumbnailUrl?: string | null }>
  onRemove:        () => void
  onImageOverride: (imageId: string | null) => void
  dragHandleProps: React.HTMLAttributes<HTMLDivElement>
}) {
  const displayImage = entry.imageOverride ?? entry.product.image
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 12px',
        borderBottom: '1px solid var(--border-soft)',
        background: 'var(--bg-surface)',
      }}
    >
      <div {...dragHandleProps} style={{ cursor: 'grab', color: 'var(--fg-subtle)', flexShrink: 0 }}>
        <GripVertical size={16} />
      </div>

      <ProductThumb url={displayImage?.thumbnailUrl ?? displayImage?.url} size={36} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 'var(--fs-sm)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {entry.product.name}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-subtle)' }}>
          {entry.product.code} · {priceLabel(entry.product.price1)}
        </div>
      </div>

      {/* Image override select */}
      <select
        className="input"
        style={{ width: 140, fontSize: 11, padding: '4px 6px' }}
        value={entry.imageOverrideId ?? ''}
        onChange={(e) => onImageOverride(e.target.value || null)}
        title="Imagen para este catálogo"
      >
        <option value="">Imagen del producto</option>
        {images.map((img) => (
          <option key={img.id} value={img.id}>
            {img.filename.length > 20 ? img.filename.slice(0, 20) + '…' : img.filename}
          </option>
        ))}
      </select>

      <button
        className="btn ghost sm"
        title="Quitar del catálogo"
        onClick={onRemove}
        style={{ color: 'var(--danger)', flexShrink: 0 }}
      >
        <X size={14} />
      </button>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function CatalogBuilderPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: catalog, isLoading } = useCatalog(id)
  const addProducts   = useAddProductsToCatalog()
  const removeProduct = useRemoveProductFromCatalog()
  const reorder       = useReorderCatalogProducts()
  const setImageOverride = useSetCatalogProductImageOverride()
  const publishMut    = usePublishCatalog()
  const unpublishMut  = useUnpublishCatalog()
  const updateCatalog = useUpdateCatalog()
  const createPdfJob  = useCreatePdfJob()

  // Product search for left panel
  const [search,       setSearch]       = useState('')
  const [categoryId,   setCategoryId]   = useState('')
  const [showConfig,   setShowConfig]   = useState(false)
  const [isAddingAll,  setIsAddingAll]  = useState(false)

  const { data: productsData } = useProducts({ search, categoryId: categoryId || undefined, limit: 50 })
  const { data: imagesData }   = useImages({ page: 1, limit: 200 })
  const { data: categories = [] } = useCategoriesFlat()

  const allProducts = useMemo(() => productsData?.data ?? [], [productsData])
  const allImages   = useMemo(() => imagesData?.data ?? [], [imagesData])

  // Local order state for optimistic drag & drop
  const [localEntries, setLocalEntries] = useState<CatalogProductEntry[] | null>(null)
  const displayEntries = useMemo(
    () => localEntries ?? catalog?.products ?? [],
    [localEntries, catalog?.products],
  )

  // Sync local state when catalog reloads (after add/remove)
  const prevCatalogEntries = useRef<CatalogProductEntry[] | null>(null)
  useEffect(() => {
    if (catalog?.products && catalog.products !== prevCatalogEntries.current) {
      prevCatalogEntries.current = catalog.products
      setLocalEntries(null) // reset local so we use server order
    }
  }, [catalog?.products])

  // IDs already in catalog
  const inCatalogIds = useMemo(
    () => new Set(displayEntries.map((e) => e.productId)),
    [displayEntries],
  )

  const availableProducts = useMemo(
    () => allProducts.filter((p) => !inCatalogIds.has(p.id)),
    [allProducts, inCatalogIds],
  )

  // Products in the panel that actually have an image (eligible for bulk-add)
  const addableProducts = useMemo(
    () => availableProducts.filter((p) => p.image != null),
    [availableProducts],
  )

  // ── Drag & Drop ──────────────────────────────────────────────────────────────

  const dragIdx = useRef<number | null>(null)
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null)

  const onDragStart = useCallback((idx: number) => {
    dragIdx.current = idx
    setDraggingIdx(idx)
  }, [])

  const onDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault()
    if (dragIdx.current === null || dragIdx.current === idx) return
    setLocalEntries((prev) => {
      const arr = [...(prev ?? catalog?.products ?? [])]
      const [moved] = arr.splice(dragIdx.current!, 1)
      arr.splice(idx, 0, moved)
      dragIdx.current = idx
      return arr
    })
  }, [catalog])

  const onDrop = useCallback(async () => {
    setDraggingIdx(null)
    if (!localEntries) return
    const items = localEntries.map((e, i) => ({ productId: e.productId, position: i }))
    await reorder.mutateAsync({ catalogId: id, items })
  }, [localEntries, id, reorder])

  // ── Actions ──────────────────────────────────────────────────────────────────

  const handleAdd = async (product: Product) => {
    await addProducts.mutateAsync({ catalogId: id, productIds: [product.id] })
  }

  const handleAddAll = async () => {
    setIsAddingAll(true)
    try {
      // Fetch ALL matching products (not just the 50 visible in the panel) so bulk-add is complete
      const result = await productsService.list({
        search: search || undefined,
        categoryId: categoryId || undefined,
        limit: 1200,
        page: 1,
      })
      const eligible = result.data.filter(
        (p) => p.image != null && !inCatalogIds.has(p.id),
      )
      if (eligible.length === 0) return
      await addProducts.mutateAsync({
        catalogId: id,
        productIds: eligible.map((p) => p.id),
      })
    } finally {
      setIsAddingAll(false)
    }
  }

  const handleRemove = async (productId: string) => {
    await removeProduct.mutateAsync({ catalogId: id, productId })
  }

  const handleImageOverride = async (productId: string, imageOverrideId: string | null) => {
    await setImageOverride.mutateAsync({ catalogId: id, productId, imageOverrideId })
  }

  const togglePublish = async () => {
    if (!catalog) return
    if (catalog.guestVisible) {
      await unpublishMut.mutateAsync(catalog.id)
    } else {
      await publishMut.mutateAsync(catalog.id)
    }
  }

  const handleConfigChange = async (key: keyof CatalogConfig, value: unknown) => {
    if (!catalog) return
    const newConfig = { ...(catalog.config as CatalogConfig), [key]: value }
    await updateCatalog.mutateAsync({ id: catalog.id, data: { config: newConfig as Record<string, unknown> } })
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="page" style={{ paddingTop: 80, textAlign: 'center', color: 'var(--fg-subtle)' }}>
        Cargando catálogo…
      </div>
    )
  }

  if (!catalog) {
    return (
      <div className="page" style={{ paddingTop: 80, textAlign: 'center', color: 'var(--fg-subtle)' }}>
        Catálogo no encontrado.
      </div>
    )
  }

  const config = (catalog.config as CatalogConfig | null) ?? DEFAULT_CATALOG_CONFIG

  return (
    <div className="page" style={{ maxWidth: 'none', padding: 'var(--s-6) var(--s-7)' }}>
      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
        flexWrap: 'wrap',
      }}>
        <button className="btn ghost sm" onClick={() => navigate('/catalogs')}>
          <ArrowLeft size={14} /> Catálogos
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 'var(--fs-xl)', fontWeight: 700 }}>{catalog.name}</h1>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-subtle)' }}>
            /{catalog.slug}
          </span>
        </div>

        <span className={`pill ${catalog.guestVisible ? 'ok' : 'dim'}`}>
          {catalog.guestVisible ? '● Publicado' : '○ Borrador'}
        </span>

        <button
          className={`btn ${catalog.guestVisible ? 'secondary' : 'primary'} sm`}
          onClick={togglePublish}
          disabled={publishMut.isPending || unpublishMut.isPending}
        >
          {catalog.guestVisible ? <><EyeOff size={13} /> Despublicar</> : <><Eye size={13} /> Publicar</>}
        </button>

        {catalog.guestVisible && (
          <a
            href={`/view/${catalog.slug}`}
            target="_blank"
            rel="noreferrer"
            className="btn ghost sm"
          >
            <ExternalLink size={13} /> Vista pública
          </a>
        )}

        <button
          className="btn secondary sm"
          onClick={() => setShowConfig((v) => !v)}
        >
          <Settings size={13} /> Config {showConfig ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        <button
          className="btn primary sm"
          disabled={createPdfJob.isPending}
          title="Genera un PDF descargable de este catálogo"
          onClick={async () => {
            await createPdfJob.mutateAsync(catalog.id)
            navigate('/pdf-jobs')
          }}
        >
          <FileDown size={13} />
          {createPdfJob.isPending ? 'Enviando…' : 'Exportar PDF'}
        </button>
      </div>

      {/* ── Config panel (collapsible) ── */}
      {showConfig && (
        <div className="card card-pad" style={{ marginBottom: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Configuración del catálogo</div>
          <ConfigPanel config={config} onChange={handleConfigChange} />
        </div>
      )}

      {/* ── Two-column layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16 }}>

        {/* Left: Add products */}
        <div className="card" style={{ height: 'fit-content' }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600 }}>Agregar productos</span>
            {addableProducts.length > 0 && (
              <button
                className="btn primary sm"
                style={{ fontSize: 11, padding: '3px 8px' }}
                disabled={isAddingAll || addProducts.isPending}
                onClick={handleAddAll}
                title="Agregar todos los productos con imagen del filtro actual"
              >
                + Agregar todos ({addableProducts.length}{addableProducts.length === 50 ? '+' : ''})
              </button>
            )}
          </div>
          <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ position: 'relative', marginBottom: 8 }}>
              <Search size={13} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-subtle)' }} />
              <input
                className="input"
                style={{ paddingLeft: 28, fontSize: 'var(--fs-sm)' }}
                placeholder="Buscar producto…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="input"
              style={{ fontSize: 'var(--fs-sm)' }}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div style={{ maxHeight: 520, overflowY: 'auto' }}>
            {availableProducts.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--fg-subtle)', fontSize: 'var(--fs-sm)' }}>
                {search || categoryId
                  ? 'Sin resultados. Prueba otro filtro.'
                  : 'Todos los productos ya están en el catálogo.'}
              </div>
            ) : (
              availableProducts.map((product) => {
                const hasImage = product.image != null
                return (
                  <div
                    key={product.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '7px 12px',
                      borderBottom: '1px solid var(--border-soft)',
                      opacity: hasImage ? 1 : 0.45,
                    }}
                  >
                    <ProductThumb
                      url={product.image?.thumbnailUrl ?? product.image?.url}
                      size={32}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {product.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--fg-subtle)', fontFamily: 'var(--font-mono)' }}>
                        {product.code}
                        {!hasImage && (
                          <span style={{ marginLeft: 6, color: 'var(--danger)', fontSize: 10 }}>sin imagen</span>
                        )}
                      </div>
                    </div>
                    <button
                      className="btn primary sm"
                      style={{ padding: '3px 8px', fontSize: 11 }}
                      onClick={() => handleAdd(product)}
                      disabled={addProducts.isPending || !hasImage}
                      title={hasImage ? 'Agregar al catálogo' : 'Requiere imagen para agregar al catálogo'}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right: Catalog products (drag & drop) */}
        <div className="card">
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600 }}>
              Productos del catálogo
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-subtle)', marginLeft: 8 }}>
                {displayEntries.length}
              </span>
            </span>
            {reorder.isPending && (
              <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--fg-subtle)' }}>Guardando orden…</span>
            )}
          </div>

          {displayEntries.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--fg-subtle)' }}>
              <ImageIcon size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
              <p style={{ margin: 0, fontWeight: 600 }}>Catálogo vacío</p>
              <p className="p-sm" style={{ margin: '6px 0 0' }}>
                Agrega productos desde el panel izquierdo.
              </p>
            </div>
          ) : (
            <div>
              {displayEntries.map((entry, idx) => (
                <div
                  key={entry.id}
                  draggable
                  onDragStart={() => onDragStart(idx)}
                  onDragOver={(e) => onDragOver(e, idx)}
                  onDrop={onDrop}
                  style={{ opacity: draggingIdx === idx ? 0.5 : 1 }}
                >
                  <CatalogProductRow
                    entry={entry}
                    images={allImages}
                    onRemove={() => handleRemove(entry.productId)}
                    onImageOverride={(imgId) => handleImageOverride(entry.productId, imgId)}
                    dragHandleProps={{}}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
