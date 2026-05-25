import { useState } from 'react'
import { Plus, Pencil, Trash2, ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react'
import { useCategoriesTree, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories'
import type { CategoryNode } from '@/services/categories.service'
import ConfirmModal from '@/components/ui/ConfirmModal'

// ── Fila de categoría (recursiva) ──
function CategoryRow({
  cat,
  depth,
  onEdit,
  onDelete,
  onAddChild,
}: {
  cat:        CategoryNode
  depth:      number
  onEdit:     (c: CategoryNode) => void
  onDelete:   (c: CategoryNode) => void
  onAddChild: (parentId: string) => void
}) {
  const [open, setOpen] = useState(true)
  const hasChildren = cat.children.length > 0

  return (
    <>
      <tr>
        <td style={{ paddingLeft: 12 + depth * 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {hasChildren ? (
              <button className="btn ghost sm" style={{ padding: 2 }} onClick={() => setOpen((o) => !o)}>
                {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              </button>
            ) : (
              <span style={{ width: 21, display: 'inline-block' }} />
            )}
            {open && hasChildren ? <FolderOpen size={14} color="var(--accent)" /> : <Folder size={14} color="var(--fg-subtle)" />}
            <span style={{ fontWeight: depth === 0 ? 600 : 400, fontSize: 13 }}>{cat.name}</span>
          </div>
        </td>
        <td>
          <span className="mono" style={{ fontSize: 11, color: 'var(--fg-subtle)' }}>
            {cat._count.products} producto(s)
          </span>
        </td>
        <td>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="btn ghost sm" title="Agregar subcategoría" onClick={() => onAddChild(cat.id)}>
              <Plus size={12} />
            </button>
            <button className="btn ghost sm" title="Editar" onClick={() => onEdit(cat)}>
              <Pencil size={12} />
            </button>
            <button
              className="btn ghost sm" title="Eliminar"
              style={{ color: 'var(--danger)' }}
              onClick={() => onDelete(cat)}
            >
              <Trash2 size={12} />
            </button>
          </div>
        </td>
      </tr>
      {open && cat.children.map((child) => (
        <CategoryRow
          key={child.id}
          cat={child as CategoryNode}
          depth={depth + 1}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
        />
      ))}
    </>
  )
}

// ── Modal crear/editar ──
function CategoryModal({
  cat,
  parentId,
  onClose,
}: {
  cat?:      CategoryNode | null
  parentId?: string
  onClose:   () => void
}) {
  const [name, setName] = useState(cat?.name ?? '')
  const create = useCreateCategory()
  const update = useUpdateCategory()
  const isEdit = !!cat
  const isPending = create.isPending || update.isPending

  const handleSave = async () => {
    if (!name.trim()) return
    if (isEdit) {
      await update.mutateAsync({ id: cat.id, data: { name } })
    } else {
      await create.mutateAsync({ name, parentId })
    }
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(31,30,26,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="card card-pad" style={{ width: '100%', maxWidth: 400 }}>
        <h3 style={{ margin: '0 0 16px', fontWeight: 700 }}>
          {isEdit ? 'Editar categoría' : parentId ? 'Nueva subcategoría' : 'Nueva categoría'}
        </h3>
        <div className="field" style={{ marginBottom: 20 }}>
          <label>Nombre</label>
          <input
            className="input"
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn secondary" onClick={onClose}>Cancelar</button>
          <button className="btn primary" onClick={handleSave} disabled={!name.trim() || isPending}>
            {isPending ? 'Guardando…' : isEdit ? 'Guardar' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Página principal ──
export default function CategoriesPage() {
  const { data: tree = [], isLoading } = useCategoriesTree()
  const deleteCategory = useDeleteCategory()
  const [modal, setModal]   = useState<{ type: 'create' | 'edit'; cat?: CategoryNode; parentId?: string } | null>(null)
  const [delTarget, setDelTarget] = useState<CategoryNode | null>(null)

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="crumbs">Admin · Categorías</div>
          <h1>Categorías</h1>
          <p className="desc">Árbol jerárquico de categorías y subcategorías de productos</p>
        </div>
        <button className="btn primary" onClick={() => setModal({ type: 'create' })}>
          <Plus size={14} /> Nueva categoría
        </button>
      </div>

      <div className="card" style={{ overflow: 'auto' }}>
        {isLoading && (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--fg-subtle)' }}>Cargando…</div>
        )}
        {!isLoading && tree.length === 0 && (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--fg-subtle)' }}>
            <p style={{ margin: 0, fontWeight: 600 }}>Sin categorías</p>
            <p className="p-sm" style={{ margin: '6px 0 0' }}>
              Las categorías se crean al importar un CSV, o puedes crearlas manualmente.
            </p>
          </div>
        )}
        {tree.length > 0 && (
          <table className="tbl">
            <thead>
              <tr>
                <th>Categoría</th>
                <th style={{ width: 160 }}>Productos</th>
                <th style={{ width: 120 }}></th>
              </tr>
            </thead>
            <tbody>
              {tree.map((cat) => (
                <CategoryRow
                  key={cat.id}
                  cat={cat as CategoryNode}
                  depth={0}
                  onEdit={(c) => setModal({ type: 'edit', cat: c })}
                  onDelete={(c) => setDelTarget(c)}
                  onAddChild={(parentId) => setModal({ type: 'create', parentId })}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modales */}
      {modal && (
        <CategoryModal
          cat={modal.type === 'edit' ? modal.cat : null}
          parentId={modal.parentId}
          onClose={() => setModal(null)}
        />
      )}
      {delTarget && (
        <ConfirmModal
          title="Eliminar categoría"
          message={`¿Eliminar "${delTarget.name}"? Los productos y subcategorías que contenga quedarán sin categoría asignada.`}
          loading={deleteCategory.isPending}
          onConfirm={async () => {
            await deleteCategory.mutateAsync({ id: delTarget.id })
            setDelTarget(null)
          }}
          onClose={() => setDelTarget(null)}
        />
      )}
    </div>
  )
}
