import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Pencil,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { useDeleteImage, useImages, useOverwriteImage, useUploadImages } from '@/hooks/useImages'
import type { GalleryImage } from '@/services/images.service'
import ConfirmModal from '@/components/ui/ConfirmModal'
import { useAuthStore } from '@/store/auth.store'

function bytesLabel(bytes?: number) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function ImageDetailModal({
  image,
  onClose,
  onReplace,
}: {
  image: GalleryImage
  onClose: () => void
  onReplace: (file: File) => Promise<void>
}) {
  const replaceRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [busy, setBusy] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [flipX, setFlipX] = useState(false)
  const [flipY, setFlipY] = useState(false)
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.src = image.url
    img.onload = () => setLoadedImage(img)
  }, [image.url])

  useEffect(() => {
    if (!loadedImage || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rightAngle = Math.abs(rotation % 180) === 90
    canvas.width = rightAngle ? loadedImage.height : loadedImage.width
    canvas.height = rightAngle ? loadedImage.width : loadedImage.height
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1)
    ctx.drawImage(loadedImage, -loadedImage.width / 2, -loadedImage.height / 2)
    ctx.restore()
  }, [flipX, flipY, loadedImage, rotation])

  const handleReplace = async (file?: File) => {
    setBusy(true)
    try {
      if (file) {
        await onReplace(file)
      } else if (canvasRef.current) {
        const blob = await new Promise<Blob | null>((resolve) => {
          canvasRef.current?.toBlob((value) => resolve(value), 'image/jpeg', 0.9)
        })
        if (!blob) return
        const editedFile = new File([blob], image.filename, { type: 'image/jpeg' })
        await onReplace(editedFile)
      }
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(31,30,26,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="card" style={{ width: '100%', maxWidth: 920, maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px', borderBottom: '1px solid var(--border)',
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 'var(--fs-lg)', fontWeight: 700 }}>Editor de imagen</h2>
            <p className="p-sm" style={{ margin: '4px 0 0' }}>
              Puedes rotar o voltear la imagen; al guardar se sobrescribe el original y se conserva el nombre.
            </p>
          </div>
          <button className="btn ghost sm" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1.25fr 0.9fr', gap: 20 }}>
          <div className="card" style={{ background: 'var(--bg-muted)', padding: 12 }}>
            <canvas
              ref={canvasRef}
              style={{ width: '100%', maxHeight: 560, objectFit: 'contain', borderRadius: 10, display: 'block' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card card-pad">
              <div className="eyebrow" style={{ marginBottom: 8 }}>Archivo actual</div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>{image.filename}</div>
              <div className="p-sm">Dimensiones: {image.width ?? '—'} × {image.height ?? '—'}</div>
              <div className="p-sm">Tamaño: {bytesLabel(image.sizeBytes)}</div>
              <div className="p-sm">Uso: {image.usageCount ?? 0} producto(s)</div>
            </div>

            <div className="card card-pad">
              <div className="eyebrow" style={{ marginBottom: 8 }}>Edición básica</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                <button type="button" className="btn secondary sm" onClick={() => setRotation((value) => (value - 90 + 360) % 360)}>
                  Rotar -90°
                </button>
                <button type="button" className="btn secondary sm" onClick={() => setRotation((value) => (value + 90) % 360)}>
                  Rotar +90°
                </button>
                <button type="button" className="btn secondary sm" onClick={() => setFlipX((value) => !value)}>
                  Voltear H
                </button>
                <button type="button" className="btn secondary sm" onClick={() => setFlipY((value) => !value)}>
                  Voltear V
                </button>
                <button
                  type="button"
                  className="btn ghost sm"
                  onClick={() => { setRotation(0); setFlipX(false); setFlipY(false) }}
                >
                  Reset
                </button>
              </div>
              <p className="p-sm" style={{ margin: '0 0 12px' }}>
                Guarda la edición actual o reemplaza la imagen por otro archivo optimizado. El vínculo con productos se mantiene.
              </p>
              <input
                ref={replaceRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={(e) => handleReplace(e.target.files?.[0])}
              />
              <button
                className="btn primary"
                disabled={busy}
                onClick={() => handleReplace()}
              >
                {busy ? 'Guardando…' : 'Guardar edición'}
              </button>
              <button
                className="btn secondary"
                disabled={busy}
                onClick={() => replaceRef.current?.click()}
              >
                <Pencil size={14} />
                Reemplazar por archivo
              </button>
            </div>

            <div className="card card-pad">
              <div className="eyebrow" style={{ marginBottom: 8 }}>Productos vinculados</div>
              {(image.linkedProducts?.length ?? 0) > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {image.linkedProducts?.map((product) => (
                    <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{product.name}</span>
                      <span className="mono" style={{ fontSize: 12, color: 'var(--fg-subtle)' }}>{product.code}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="p-sm" style={{ margin: 0 }}>Aún no está vinculada a ningún producto.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ImagesPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [unlinkedOnly, setUnlinkedOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [detailImage, setDetailImage] = useState<GalleryImage | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<GalleryImage | null>(null)

  const { user } = useAuthStore()
  const { data, isLoading, isFetching } = useImages({
    search: search || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    unlinkedOnly: unlinkedOnly || undefined,
    page,
    limit: 24,
  })
  const { uploadProgress, ...uploadMutation } = useUploadImages()
  const overwriteMutation = useOverwriteImage()
  const deleteMutation = useDeleteImage()

  const images = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / 24))
  const allCurrentSelected = images.length > 0 && images.every((image) => selected.has(image.id))

  const selectionLabel = useMemo(() => `${selected.size} seleccionada(s)`, [selected])

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allCurrentSelected) images.forEach((image) => next.delete(image.id))
      else images.forEach((image) => next.add(image.id))
      return next
    })
  }

  const handleUpload = async (fileList?: FileList | null) => {
    const files = fileList ? Array.from(fileList) : []
    if (files.length === 0) return
    await uploadMutation.mutateAsync(files)
    setPage(1)
  }

  const handleDeleteSelected = async () => {
    for (const id of [...selected]) {
      await deleteMutation.mutateAsync(id)
    }
    setSelected(new Set())
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="crumbs">Admin · Imágenes</div>
          <h1>Galería de imágenes</h1>
          <p className="desc">
            {isLoading ? 'Cargando galería…' : `${total.toLocaleString()} imágenes disponibles para vincular a productos`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {selected.size > 0 && user?.role === 'admin' && (
            <button className="btn danger" onClick={handleDeleteSelected} disabled={deleteMutation.isPending}>
              <Trash2 size={14} />
              {deleteMutation.isPending ? 'Eliminando…' : `Eliminar ${selectionLabel}`}
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={(e) => handleUpload(e.target.files)}
          />
          <button className="btn primary" onClick={() => fileInputRef.current?.click()} disabled={uploadMutation.isPending}>
            <Upload size={14} />
            {uploadProgress
              ? `Lote ${uploadProgress.current} / ${uploadProgress.total}…`
              : uploadMutation.isPending
                ? 'Subiendo…'
                : 'Subir imágenes'}
          </button>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.9fr 0.9fr auto', gap: 10, alignItems: 'end' }}>
          <div className="field">
            <label>Buscar por archivo</label>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-subtle)' }} />
              <input
                className="input"
                style={{ paddingLeft: 32 }}
                placeholder="Ej. GE-75003WW"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              />
            </div>
          </div>
          <div className="field">
            <label>Desde</label>
            <input className="input" type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1) }} />
          </div>
          <div className="field">
            <label>Hasta</label>
            <input className="input" type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1) }} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 10, fontSize: 13 }}>
            <input type="checkbox" checked={unlinkedOnly} onChange={(e) => { setUnlinkedOnly(e.target.checked); setPage(1) }} />
            Solo sin vincular
          </label>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--fg-muted)' }}>
          <input type="checkbox" checked={allCurrentSelected} onChange={toggleAll} />
          Seleccionar página
        </label>
        {isFetching && !isLoading && (
          <span className="p-sm">Actualizando galería…</span>
        )}
      </div>

      {uploadMutation.isError && (
        <div style={{
          background: 'var(--danger-tint)', color: 'var(--danger)',
          padding: '10px 12px', borderRadius: 'var(--r-md)', marginBottom: 14, fontSize: 'var(--fs-sm)',
        }}>
          No se pudieron subir las imágenes.
        </div>
      )}

      {!isLoading && images.length === 0 && (
        <div className="card dashed card-pad" style={{ textAlign: 'center', padding: 48 }}>
          <ImageIcon size={28} style={{ color: 'var(--fg-subtle)', marginBottom: 8 }} />
          <p style={{ margin: 0, fontWeight: 600 }}>No hay imágenes para mostrar</p>
          <p className="p-sm" style={{ margin: '8px 0 0' }}>
            Sube imágenes con nombres iguales al campo `code` del CSV para vinculación automática.
          </p>
        </div>
      )}

      {images.length > 0 && (
        <div className="image-grid">
          {images.map((image) => (
            <div key={image.id} className="card image-card">
              <label className="image-check">
                <input
                  type="checkbox"
                  checked={selected.has(image.id)}
                  onChange={() => {
                    setSelected((prev) => {
                      const next = new Set(prev)
                      if (next.has(image.id)) next.delete(image.id)
                      else next.add(image.id)
                      return next
                    })
                  }}
                />
              </label>

              <button className="image-thumb-btn" onClick={() => setDetailImage(image)}>
                <img
                  src={image.thumbnailUrl ?? image.url}
                  alt={image.filename}
                  loading="lazy"
                  className="image-thumb"
                />
              </button>

              <div className="image-card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {image.baseName ?? image.filename}
                    </div>
                    <div className="p-sm" style={{ marginTop: 2 }}>
                      {image.width ?? '—'} × {image.height ?? '—'} · {bytesLabel(image.sizeBytes)}
                    </div>
                  </div>
                  <span className={`pill ${(image.usageCount ?? 0) > 0 ? 'ok' : 'warn'}`}>
                    {(image.usageCount ?? 0) > 0 ? 'vinculada' : 'sin uso'}
                  </span>
                </div>

                <div style={{ marginTop: 10, minHeight: 34 }}>
                  {(image.linkedProducts?.length ?? 0) > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {image.linkedProducts?.slice(0, 2).map((product) => (
                        <span key={product.id} className="pill dim">{product.code}</span>
                      ))}
                      {(image.linkedProducts?.length ?? 0) > 2 && (
                        <span className="pill dim">+{(image.linkedProducts?.length ?? 0) - 2}</span>
                      )}
                    </div>
                  ) : (
                    <div className="p-sm">No vinculada a productos</div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button className="btn secondary sm" onClick={() => setDetailImage(image)}>
                    <Pencil size={13} /> Editar
                  </button>
                  <button className="btn ghost sm" style={{ color: 'var(--danger)' }} onClick={() => setDeleteTarget(image)}>
                    <Trash2 size={13} /> Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginTop: 18 }}>
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

      {detailImage && (
        <ImageDetailModal
          image={detailImage}
          onClose={() => setDetailImage(null)}
          onReplace={async (file) => {
            await overwriteMutation.mutateAsync({ id: detailImage.id, file })
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Eliminar imagen"
          message={`¿Eliminar "${deleteTarget.filename}"? Los productos vinculados quedarán sin imagen.`}
          loading={deleteMutation.isPending}
          onConfirm={async () => {
            await deleteMutation.mutateAsync(deleteTarget.id)
            setDeleteTarget(null)
            setSelected((prev) => {
              const next = new Set(prev)
              next.delete(deleteTarget.id)
              return next
            })
          }}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}