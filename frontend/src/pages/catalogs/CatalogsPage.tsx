import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen, Plus, Pencil, Trash2, ExternalLink,
  Eye, EyeOff, Wrench, X,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  useCatalogs, useCreateCatalog, useUpdateCatalog,
  useDeleteCatalog, usePublishCatalog, useUnpublishCatalog,
} from '@/hooks/useCatalogs'
import ConfirmModal from '@/components/ui/ConfirmModal'
import type { Catalog } from '@/types'

// ─── Form schema ───────────────────────────────────────────────────────────────

const schema = z.object({
  name:        z.string().min(1, 'Requerido').max(255),
  description: z.string().optional(),
})
type FormData = z.infer<typeof schema>

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatusPill({ visible }: { visible: boolean }) {
  return (
    <span className={`pill ${visible ? 'ok' : 'dim'}`}>
      {visible ? '● Publicado' : '○ Borrador'}
    </span>
  )
}

function CatalogFormModal({
  catalog,
  onClose,
}: {
  catalog?: Catalog | null
  onClose: () => void
}) {
  const isEdit  = !!catalog
  const create  = useCreateCatalog()
  const update  = useUpdateCatalog()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name:        catalog?.name ?? '',
      description: catalog?.description ?? '',
    },
  })

  const onSubmit = async (data: FormData) => {
    const payload = {
      name:        data.name,
      description: data.description?.trim() || null,
    }
    if (isEdit && catalog) {
      await update.mutateAsync({ id: catalog.id, data: payload })
    } else {
      await create.mutateAsync(payload)
    }
    onClose()
  }

  const apiError = create.error || update.error

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
          <h2 style={{ margin: 0, fontSize: 'var(--fs-lg)', fontWeight: 700 }}>
            {isEdit ? 'Editar catálogo' : 'Nuevo catálogo'}
          </h2>
          <button className="btn ghost sm" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: 20 }}>
          <div className="field" style={{ marginBottom: 14 }}>
            <label>Nombre *</label>
            <input
              className={`input${errors.name ? ' error' : ''}`}
              {...register('name')}
              placeholder="Ej. Catálogo Temporada 2026"
            />
            {errors.name && (
              <span style={{ fontSize: 11, color: 'var(--danger)' }}>{errors.name.message}</span>
            )}
          </div>
          <div className="field" style={{ marginBottom: 20 }}>
            <label>Descripción</label>
            <textarea
              className="input"
              rows={3}
              style={{ resize: 'vertical' }}
              placeholder="Descripción opcional del catálogo…"
              {...register('description')}
            />
          </div>
          {apiError && (
            <div style={{
              background: 'var(--danger-tint)', color: 'var(--danger)',
              padding: '10px 12px', borderRadius: 'var(--r-md)',
              fontSize: 'var(--fs-sm)', marginBottom: 14,
            }}>
              {(apiError as { response?: { data?: { message?: string } } })?.response?.data?.message
                ?? 'Error al guardar el catálogo'}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn primary" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear catálogo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function CatalogsPage() {
  const navigate = useNavigate()
  const { data: catalogs = [], isLoading } = useCatalogs()
  const deleteMut   = useDeleteCatalog()
  const publishMut  = usePublishCatalog()
  const unpublishMut = useUnpublishCatalog()

  const [showForm,     setShowForm]     = useState(false)
  const [editCatalog,  setEditCatalog]  = useState<Catalog | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Catalog | null>(null)

  const handleDelete = async () => {
    if (!deleteTarget) return
    await deleteMut.mutateAsync(deleteTarget.id)
    setDeleteTarget(null)
  }

  const toggleVisibility = async (catalog: Catalog) => {
    if (catalog.guestVisible) {
      await unpublishMut.mutateAsync(catalog.id)
    } else {
      await publishMut.mutateAsync(catalog.id)
    }
  }

  const openCreate = () => { setEditCatalog(null); setShowForm(true) }
  const openEdit   = (c: Catalog) => { setEditCatalog(c); setShowForm(true) }

  return (
    <div className="page">
      {/* Header */}
      <div className="page-head">
        <div>
          <div className="crumbs">Admin · Catálogos</div>
          <h1>Catálogos</h1>
          <p className="desc">
            {isLoading ? '…' : `${catalogs.length} catálogo${catalogs.length !== 1 ? 's' : ''} en el sistema`}
          </p>
        </div>
        <button className="btn primary" onClick={openCreate}>
          <Plus size={14} /> Nuevo catálogo
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--fg-subtle)' }}>
          Cargando catálogos…
        </div>
      ) : catalogs.length === 0 ? (
        <div className="card dashed card-pad" style={{ textAlign: 'center', padding: 48 }}>
          <BookOpen size={32} style={{ color: 'var(--fg-subtle)', marginBottom: 12 }} />
          <p style={{ margin: 0, fontWeight: 600, color: 'var(--fg-muted)' }}>
            Aún no hay catálogos
          </p>
          <p className="p-sm" style={{ margin: '6px 0 16px' }}>
            Crea tu primer catálogo para empezar a agregar productos.
          </p>
          <button className="btn primary" onClick={openCreate}>
            <Plus size={14} /> Crear catálogo
          </button>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'auto' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Nombre</th>
                <th style={{ width: 120 }}>Estado</th>
                <th style={{ width: 80 }}>Productos</th>
                <th style={{ width: 130 }}>Creado por</th>
                <th style={{ width: 120 }}>Actualizado</th>
                <th style={{ width: 180 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {catalogs.map((catalog) => (
                <tr key={catalog.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{catalog.name}</div>
                    {catalog.description && (
                      <div className="p-sm" style={{ marginTop: 2 }}>
                        {catalog.description.length > 60
                          ? catalog.description.slice(0, 60) + '…'
                          : catalog.description}
                      </div>
                    )}
                    <div style={{ marginTop: 2, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-subtle)' }}>
                      /{catalog.slug}
                    </div>
                  </td>
                  <td><StatusPill visible={catalog.guestVisible} /></td>
                  <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                    {catalog._count?.products ?? 0}
                  </td>
                  <td style={{ fontSize: 'var(--fs-sm)' }}>
                    {catalog.creator?.name ?? catalog.createdBy}
                  </td>
                  <td style={{ fontSize: 'var(--fs-sm)', color: 'var(--fg-subtle)' }}>
                    {new Date(catalog.updatedAt).toLocaleDateString('es-GT')}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      <button
                        className="btn ghost sm"
                        title="Abrir editor"
                        onClick={() => navigate(`/catalogs/${catalog.id}/builder`)}
                      >
                        <Wrench size={13} />
                      </button>
                      <button
                        className="btn ghost sm"
                        title="Editar info"
                        onClick={() => openEdit(catalog)}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        className="btn ghost sm"
                        title={catalog.guestVisible ? 'Despublicar' : 'Publicar'}
                        onClick={() => toggleVisibility(catalog)}
                        disabled={publishMut.isPending || unpublishMut.isPending}
                      >
                        {catalog.guestVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                      {catalog.guestVisible && (
                        <a
                          href={`/view/${catalog.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn ghost sm"
                          title="Vista pública"
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                      <button
                        className="btn ghost sm"
                        title="Eliminar"
                        onClick={() => setDeleteTarget(catalog)}
                        style={{ color: 'var(--danger)' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modales */}
      {showForm && (
        <CatalogFormModal
          catalog={editCatalog}
          onClose={() => { setShowForm(false); setEditCatalog(null) }}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Eliminar catálogo"
          message={`¿Eliminar "${deleteTarget.name}"? Esta acción no se puede deshacer.`}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
