import { useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Image as ImageIcon, Upload, X } from 'lucide-react'
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProducts'
import { useCategoriesFlat } from '@/hooks/useCategories'
import { useImages, useUploadImages } from '@/hooks/useImages'
import type { Product } from '@/types'

const schema = z.object({
  name:        z.string().min(1, 'Requerido'),
  code:        z.string().min(1, 'Requerido'),
  description: z.string().optional(),
  categoryId:  z.string().optional(),
  price1:      z.string().optional(),
  price2:      z.string().optional(),
  price3:      z.string().optional(),
  price4:      z.string().optional(),
  price5:      z.string().optional(),
  price6:      z.string().optional(),
  stock:       z.string().optional(),
})

type FormData = z.infer<typeof schema>

const toNum = (v: string | undefined): number | null => {
  if (!v || v.trim() === '') return null
  const n = parseFloat(v)
  return isNaN(n) ? null : n
}

const toInt = (v: string | undefined): number | null => {
  if (!v || v.trim() === '') return null
  const n = parseInt(v, 10)
  return isNaN(n) ? null : n
}

interface ProductPayload {
  name:        string
  code:        string
  description: string | null
  categoryId:  string | null
  price1:      number | null
  price2:      number | null
  price3:      number | null
  price4:      number | null
  price5:      number | null
  price6:      number | null
  stock:       number | null
  imageId:     string | null
}

interface Props {
  product?: Product | null
  onClose: () => void
}

export default function ProductFormModal({ product, onClose }: Props) {
  const isEdit = !!product
  const create = useCreateProduct()
  const update = useUpdateProduct()
  const uploadImage = useUploadImages()
  const { data: categories = [] } = useCategoriesFlat()
  const { data: imagesData } = useImages({ page: 1, limit: 100 })
  const uploadRef = useRef<HTMLInputElement>(null)
  const [selectedImageId, setSelectedImageId] = useState<string>(product?.imageId ?? '')
  const defaultValues = {
    name:        product?.name ?? '',
    code:        product?.code ?? '',
    description: product?.description ?? '',
    categoryId:  product?.categoryId ?? '',
    price1:      product?.price1 != null ? String(product.price1) : '',
    price2:      product?.price2 != null ? String(product.price2) : '',
    price3:      product?.price3 != null ? String(product.price3) : '',
    price4:      product?.price4 != null ? String(product.price4) : '',
    price5:      product?.price5 != null ? String(product.price5) : '',
    price6:      product?.price6 != null ? String(product.price6) : '',
    stock:       product?.stock != null ? String(product.stock) : '',
  }

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema), defaultValues })

  const images = useMemo(() => imagesData?.data ?? [], [imagesData])
  const selectedImage = useMemo(
    () => images.find((image) => image.id === selectedImageId),
    [images, selectedImageId],
  )

  const handleImageUpload = async (file?: File) => {
    if (!file) return
    const result = await uploadImage.mutateAsync([file])
    const created = result.uploaded[0]?.image
    if (created) {
      setSelectedImageId(created.id)
    }
  }

  const onSubmit = async (data: FormData) => {
    const payload: ProductPayload = {
      name:        data.name,
      code:        data.code,
      description: data.description?.trim() !== '' ? (data.description ?? null) : null,
      categoryId:  data.categoryId !== '' ? (data.categoryId ?? null) : null,
      price1:      toNum(data.price1),
      price2:      toNum(data.price2),
      price3:      toNum(data.price3),
      price4:      toNum(data.price4),
      price5:      toNum(data.price5),
      price6:      toNum(data.price6),
      stock:       toInt(data.stock),
      imageId:     selectedImageId || null,
    }

    if (isEdit && product) {
      await update.mutateAsync({ id: product.id, data: payload as Partial<Product> })
    } else {
      await create.mutateAsync(payload as Partial<Product>)
    }
    onClose()
  }

  const apiError = create.error || update.error || uploadImage.error

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(31,30,26,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="card" style={{ width: '100%', maxWidth: 600, maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px', borderBottom: '1px solid var(--border)',
        }}>
          <h2 style={{ margin: 0, fontSize: 'var(--fs-lg)', fontWeight: 700 }}>
            {isEdit ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <button className="btn ghost sm" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div className="field">
              <label>Nombre *</label>
              <input className={`input${errors.name ? ' error' : ''}`} {...register('name')} />
              {errors.name && <span style={{ fontSize: 11, color: 'var(--danger)' }}>{errors.name.message}</span>}
            </div>
            <div className="field">
              <label>Código *</label>
              <input className={`input mono${errors.code ? ' error' : ''}`} {...register('code')} />
              {errors.code && <span style={{ fontSize: 11, color: 'var(--danger)' }}>{errors.code.message}</span>}
            </div>
          </div>

          <div className="field" style={{ marginBottom: 14 }}>
            <label>Descripción</label>
            <textarea className="input" rows={2} style={{ resize: 'vertical' }} {...register('description')} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div className="field">
              <label>Categoría</label>
              <select className="input" {...register('categoryId')}>
                <option value="">Sin categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Stock</label>
              <input type="number" min={0} className="input mono" {...register('stock')} />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Imagen</div>
            <div style={{ display: 'grid', gridTemplateColumns: '84px 1fr', gap: 14, alignItems: 'start' }}>
              <div
                className="ph"
                style={{ width: 84, height: 84, borderRadius: 8, background: 'var(--bg-muted)' }}
              >
                {selectedImage ? (
                  <img
                    src={selectedImage.thumbnailUrl ?? selectedImage.url}
                    alt={selectedImage.filename}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <ImageIcon size={20} />
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="field">
                  <label>Seleccionar desde galería</label>
                  <select
                    className="input"
                    value={selectedImageId}
                    onChange={(e) => setSelectedImageId(e.target.value)}
                  >
                    <option value="">Sin imagen</option>
                    {images.map((image) => (
                      <option key={image.id} value={image.id}>
                        {image.baseName ?? image.filename}
                        {image.usageCount ? ` · ${image.usageCount} uso(s)` : ' · sin vincular'}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <input
                    ref={uploadRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    style={{ display: 'none' }}
                    onChange={(e) => handleImageUpload(e.target.files?.[0])}
                  />
                  <button
                    type="button"
                    className="btn secondary"
                    disabled={uploadImage.isPending}
                    onClick={() => uploadRef.current?.click()}
                  >
                    <Upload size={14} />
                    {uploadImage.isPending ? 'Subiendo…' : 'Subir nueva imagen'}
                  </button>
                  {selectedImageId && (
                    <button type="button" className="btn ghost" onClick={() => setSelectedImageId('')}>
                      Quitar imagen
                    </button>
                  )}
                </div>
                <p className="p-sm" style={{ margin: 0 }}>
                  También puedes subir una nueva imagen directamente desde este formulario.
                </p>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Precios (Q)</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {(['price1','price2','price3','price4','price5','price6'] as const).map((p, i) => (
                <div className="field" key={p}>
                  <label>Precio {i + 1}{i === 0 ? ' *' : ''}</label>
                  <input
                    type="number" step="0.01" min={0}
                    className="input mono"
                    placeholder="0.00"
                    {...register(p)}
                  />
                </div>
              ))}
            </div>
          </div>

          {apiError && (
            <div style={{
              background: 'var(--danger-tint)', color: 'var(--danger)',
              padding: '10px 12px', borderRadius: 'var(--r-md)',
              fontSize: 'var(--fs-sm)', marginBottom: 14,
            }}>
              {(apiError as { response?: { data?: { message?: string } } })?.response?.data?.message
                ?? 'Error al guardar el producto'}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn primary" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}