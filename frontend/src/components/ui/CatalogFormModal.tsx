import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateCatalog } from '@/hooks/useCatalogs'

const schema = z.object({
  name:        z.string().min(1, 'Requerido').max(255),
  description: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Props {
  onClose: () => void
  onCreated?: () => void
}

export default function CatalogFormModal({ onClose, onCreated }: Props) {
  const create = useCreateCatalog()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '' },
  })

  const onSubmit = async (data: FormData) => {
    await create.mutateAsync({
      name:        data.name,
      description: data.description?.trim() || null,
    })
    onClose()
    onCreated?.()
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
      <div className="card" style={{ width: '100%', maxWidth: 480 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px', borderBottom: '1px solid var(--border)',
        }}>
          <h2 style={{ margin: 0, fontSize: 'var(--fs-lg)', fontWeight: 700 }}>
            Nuevo catálogo
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

          {create.error && (
            <div style={{
              background: 'var(--danger-tint)', color: 'var(--danger)',
              padding: '10px 12px', borderRadius: 'var(--r-md)',
              fontSize: 'var(--fs-sm)', marginBottom: 14,
            }}>
              {(create.error as { response?: { data?: { message?: string } } })?.response?.data?.message
                ?? 'Error al crear el catálogo'}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creando…' : 'Crear catálogo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
