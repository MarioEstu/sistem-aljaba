import { useState } from 'react'
import { X } from 'lucide-react'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { productsService } from '@/services/products.service'
import { useCategoriesFlat } from '@/hooks/useCategories'
import { PRODUCTS_KEY } from '@/hooks/useProducts'

interface Props {
  selectedIds: string[]
  onClose:     () => void
}

type ActionType = 'changeCategory' | 'applyDiscount' | 'updateStock' | 'delete'

export default function BulkEditModal({ selectedIds, onClose }: Props) {
  const qc = useQueryClient()
  const { data: categories = [] } = useCategoriesFlat()
  const [action, setAction]       = useState<ActionType>('changeCategory')
  const [categoryId, setCategoryId] = useState<string>('')
  const [discount, setDiscount]   = useState<number>(10)
  const [stock, setStock]         = useState<number>(0)

  const mutation = useMutation({
    mutationFn: () => {
      const base = { ids: selectedIds }
      switch (action) {
        case 'changeCategory':
          return productsService.bulkAction({ action, ids: selectedIds, categoryId: categoryId || null })
        case 'applyDiscount':
          return productsService.bulkAction({ ...base, action, percent: discount })
        case 'updateStock':
          return productsService.bulkAction({ ...base, action, stock })
        case 'delete':
          return productsService.bulkAction({ ...base, action })
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PRODUCTS_KEY] })
      onClose()
    },
  })

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(31,30,26,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="card" style={{ width: '100%', maxWidth: 480 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px', borderBottom: '1px solid var(--border)',
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 'var(--fs-lg)', fontWeight: 700 }}>Edición masiva</h2>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--fg-subtle)' }}>
              {selectedIds.length} producto(s) seleccionado(s)
            </p>
          </div>
          <button className="btn ghost sm" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ padding: 20 }}>
          {/* Selector de acción */}
          <div className="field" style={{ marginBottom: 20 }}>
            <label>Acción</label>
            <select className="input" value={action} onChange={(e) => setAction(e.target.value as ActionType)}>
              <option value="changeCategory">Cambiar categoría</option>
              <option value="applyDiscount">Aplicar descuento (%)</option>
              <option value="updateStock">Actualizar stock</option>
              <option value="delete">Eliminar productos</option>
            </select>
          </div>

          {/* Parámetros según acción */}
          {action === 'changeCategory' && (
            <div className="field" style={{ marginBottom: 20 }}>
              <label>Nueva categoría</label>
              <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">Sin categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {action === 'applyDiscount' && (
            <div className="field" style={{ marginBottom: 20 }}>
              <label>Descuento (%)</label>
              <input
                type="number" min={1} max={99} className="input mono"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
              />
              <span style={{ fontSize: 11, color: 'var(--fg-subtle)' }}>
                Se aplica a todos los niveles de precio (price1–price6) que no estén vacíos
              </span>
            </div>
          )}

          {action === 'updateStock' && (
            <div className="field" style={{ marginBottom: 20 }}>
              <label>Nuevo stock</label>
              <input
                type="number" min={0} className="input mono"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
              />
            </div>
          )}

          {action === 'delete' && (
            <div style={{
              background: 'var(--danger-tint)', color: 'var(--danger)',
              padding: '12px 14px', borderRadius: 'var(--r-md)', marginBottom: 20,
              fontSize: 'var(--fs-sm)',
            }}>
              Esta acción eliminará permanentemente {selectedIds.length} producto(s).
              No se puede deshacer.
            </div>
          )}

          {mutation.isError && (
            <div style={{
              background: 'var(--danger-tint)', color: 'var(--danger)',
              padding: '10px 12px', borderRadius: 'var(--r-md)', marginBottom: 14,
              fontSize: 'var(--fs-sm)',
            }}>
              Error al ejecutar la operación
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button className="btn secondary" onClick={onClose}>Cancelar</button>
            <button
              className={`btn ${action === 'delete' ? 'danger' : 'primary'}`}
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Procesando…' : 'Aplicar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
