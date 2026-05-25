import { useState, useCallback } from 'react'
import {
  Plus, Upload, Search, Filter, Pencil, Trash2,
  ChevronLeft, ChevronRight, Image as ImageIcon, CheckSquare,
} from 'lucide-react'
import { useProducts, useDeleteProduct } from '@/hooks/useProducts'
import { useCategoriesFlat } from '@/hooks/useCategories'
import type { Product } from '@/types'
import ProductFormModal from './ProductFormModal'
import CsvImportModal   from './CsvImportModal'
import BulkEditModal    from './BulkEditModal'
import ConfirmModal     from '@/components/ui/ConfirmModal'

export default function ProductsPage() {
  // ── Filtros y paginación ──
  const [search,     setSearch]     = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [page,       setPage]       = useState(1)
  const [orderBy,    setOrderBy]    = useState('name')
  const [order,      setOrder]      = useState<'asc'|'desc'>('asc')

  // ── Modales ──
  const [showCreate,   setShowCreate]   = useState(false)
  const [editProduct,  setEditProduct]  = useState<Product | null>(null)
  const [showCsv,      setShowCsv]      = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)

  // ── Selección masiva ──
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showBulk,  setShowBulk] = useState(false)

  const { data: categories = [] } = useCategoriesFlat()
  const { data, isLoading, isFetching } = useProducts({
    search, categoryId: categoryId || undefined, page, limit: 50, orderBy, order,
  })
  const deleteMutation = useDeleteProduct()

  const products = data?.data ?? []
  const total    = data?.total ?? 0
  const totalPages = Math.ceil(total / 50)

  // ── Ordenar columna ──
  const handleSort = useCallback((col: string) => {
    if (orderBy === col) setOrder((o) => o === 'asc' ? 'desc' : 'asc')
    else { setOrderBy(col); setOrder('asc') }
    setPage(1)
  }, [orderBy])

  // ── Selección ──
  const allCurrentSelected = products.length > 0 && products.every((p) => selected.has(p.id))
  const toggleAll = () => {
    setSelected((prev) => {
      const s = new Set(prev)
      if (allCurrentSelected) products.forEach((p) => s.delete(p.id))
      else products.forEach((p) => s.add(p.id))
      return s
    })
  }
  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const s = new Set(prev)
      if (s.has(id)) s.delete(id)
      else s.add(id)
      return s
    })
  }

  // ── Eliminar ──
  const handleDelete = async () => {
    if (!deleteTarget) return
    await deleteMutation.mutateAsync(deleteTarget.id)
    setDeleteTarget(null)
  }

  const sortIcon = (col: string) =>
    orderBy === col ? <span style={{ fontSize: 10 }}>{order === 'asc' ? '↑' : '↓'}</span> : null

  return (
    <div className="page">
      {/* ── Cabecera ── */}
      <div className="page-head">
        <div>
          <div className="crumbs">Admin · Productos</div>
          <h1>Productos</h1>
          <p className="desc">
            {isLoading ? '…' : `${total.toLocaleString()} productos en el sistema`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn secondary" onClick={() => setShowCsv(true)}>
            <Upload size={14} /> Importar CSV
          </button>
          <button className="btn primary" onClick={() => setShowCreate(true)}>
            <Plus size={14} /> Nuevo producto
          </button>
        </div>
      </div>

      {/* ── Barra de filtros ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        {/* Búsqueda */}
        <div style={{ position: 'relative', flex: '1 1 260px', minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-subtle)', pointerEvents: 'none' }} />
          <input
            className="input"
            style={{ paddingLeft: 32 }}
            placeholder="Buscar por nombre o código…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>

        {/* Filtro categoría */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Filter size={13} style={{ color: 'var(--fg-subtle)' }} />
          <select
            className="input"
            style={{ width: 180 }}
            value={categoryId}
            onChange={(e) => { setCategoryId(e.target.value); setPage(1) }}
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Acción masiva */}
        {selected.size > 0 && (
          <button className="btn secondary" onClick={() => setShowBulk(true)}>
            <CheckSquare size={14} />
            Editar {selected.size} seleccionados
          </button>
        )}
      </div>

      {/* ── Tabla ── */}
      <div className="card" style={{ marginBottom: 16, overflow: 'auto' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 38 }}>
                <input
                  type="checkbox"
                  checked={allCurrentSelected}
                  onChange={toggleAll}
                />
              </th>
              <th style={{ width: 64 }}>Imagen</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>
                Nombre {sortIcon('name')}
              </th>
              <th style={{ cursor: 'pointer', width: 130 }} onClick={() => handleSort('code')}>
                Código {sortIcon('code')}
              </th>
              <th style={{ width: 140 }}>Categoría</th>
              <th style={{ cursor: 'pointer', width: 100 }} onClick={() => handleSort('price1')}>
                Precio 1 {sortIcon('price1')}
              </th>
              <th style={{ cursor: 'pointer', width: 80 }} onClick={() => handleSort('stock')}>
                Stock {sortIcon('stock')}
              </th>
              <th style={{ width: 80 }}></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--fg-subtle)' }}>Cargando…</td></tr>
            )}
            {!isLoading && products.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 48, color: 'var(--fg-subtle)' }}>
                  <p style={{ margin: 0, fontWeight: 600 }}>Sin productos</p>
                  <p className="p-sm" style={{ margin: '6px 0 0' }}>
                    {search || categoryId
                      ? 'Ningún producto coincide con los filtros aplicados'
                      : 'Importa un CSV o crea el primer producto manualmente'}
                  </p>
                </td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={p.id} className={selected.has(p.id) ? 'selected' : ''}>
                <td>
                  <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleOne(p.id)} />
                </td>
                <td>
                  {p.image ? (
                    <img
                      src={p.image.thumbnailUrl ?? p.image.url}
                      alt={p.name}
                      style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--border-soft)' }}
                    />
                  ) : (
                    <div className="ph" style={{ width: 40, height: 40 }}>
                      <ImageIcon size={16} />
                    </div>
                  )}
                </td>
                <td>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{p.name}</div>
                  {p.description && (
                    <div style={{ fontSize: 11, color: 'var(--fg-subtle)', marginTop: 2, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.description}
                    </div>
                  )}
                </td>
                <td>
                  <span className="mono" style={{ fontSize: 12, background: 'var(--bg-muted)', padding: '2px 6px', borderRadius: 'var(--r-sm)' }}>
                    {p.code}
                  </span>
                </td>
                <td>
                  {p.category ? (
                    <span className="pill dim">{p.category.name}</span>
                  ) : (
                    <span style={{ color: 'var(--fg-subtle)', fontSize: 12 }}>—</span>
                  )}
                </td>
                <td>
                  <span className="mono" style={{ fontSize: 13 }}>
                    {p.price1 != null ? `Q ${Number(p.price1).toFixed(2)}` : '—'}
                  </span>
                </td>
                <td>
                  {p.stock != null ? (
                    <span className={`pill ${p.stock > 0 ? 'ok' : 'danger'}`}>
                      {p.stock.toLocaleString()}
                    </span>
                  ) : '—'}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn ghost sm" title="Editar" onClick={() => setEditProduct(p)}>
                      <Pencil size={13} />
                    </button>
                    <button className="btn ghost sm" title="Eliminar" onClick={() => setDeleteTarget(p)}
                      style={{ color: 'var(--danger)' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Paginación ── */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
          <button className="btn secondary sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft size={14} />
          </button>
          <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--fg-muted)' }}>
            Página {page} de {totalPages} · {total.toLocaleString()} resultados
          </span>
          <button className="btn secondary sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Indicador de refetch en background */}
      {isFetching && !isLoading && (
        <div style={{ position: 'fixed', bottom: 16, right: 16, background: 'var(--ink-2)', color: '#fff', fontSize: 11, padding: '6px 12px', borderRadius: 'var(--r-pill)' }}>
          Actualizando…
        </div>
      )}

      {/* ── Modales ── */}
      {showCreate    && <ProductFormModal onClose={() => setShowCreate(false)} />}
      {editProduct   && <ProductFormModal product={editProduct} onClose={() => setEditProduct(null)} />}
      {showCsv       && <CsvImportModal   onClose={() => setShowCsv(false)} />}
      {showBulk      && <BulkEditModal    selectedIds={[...selected]} onClose={() => { setShowBulk(false); setSelected(new Set()) }} />}
      {deleteTarget  && (
        <ConfirmModal
          title="Eliminar producto"
          message={`¿Eliminar "${deleteTarget.name}" (${deleteTarget.code})? Esta acción no se puede deshacer.`}
          loading={deleteMutation.isPending}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
