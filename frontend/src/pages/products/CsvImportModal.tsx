import { useState, useRef } from 'react'
import { X, Upload, AlertCircle, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { productsService, type CsvPreviewResult, type CsvRowResult } from '@/services/products.service'
import { PRODUCTS_KEY } from '@/hooks/useProducts'

interface Props { onClose: () => void }

type Step = 'upload' | 'preview' | 'done'

export default function CsvImportModal({ onClose }: Props) {
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [step, setStep]         = useState<Step>('upload')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [preview, setPreview]   = useState<CsvPreviewResult | null>(null)
  const [overwrite, setOverwrite] = useState(false)
  const [result, setResult]     = useState<{ imported: number; skipped: number; errors: number } | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Solo se aceptan archivos .csv')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await productsService.csvPreview(file)
      setPreview(data)
      setStep('preview')
    } catch (e: unknown) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? String(e))
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (!preview) return
    const importable = preview.rows.filter(
      (r) => r.status !== 'error' && (r.status !== 'duplicate' || overwrite),
    )
    setLoading(true)
    try {
      const res = await productsService.csvImport(importable, overwrite)
      setResult(res)
      setStep('done')
      qc.invalidateQueries({ queryKey: [PRODUCTS_KEY] })
    } catch {
      setError('Error durante la importación')
    } finally {
      setLoading(false)
    }
  }

  const statusIcon = (s: CsvRowResult['status']) => {
    if (s === 'ok')        return <CheckCircle   size={13} color="var(--ok)" />
    if (s === 'error')     return <AlertCircle   size={13} color="var(--danger)" />
    if (s === 'warning')   return <AlertTriangle size={13} color="var(--warn)" />
    if (s === 'duplicate') return <RefreshCw     size={13} color="var(--warn)" />
    return null
  }

  const statusLabel: Record<CsvRowResult['status'], string> = {
    ok:        'OK',
    error:     'Error',
    warning:   'Aviso',
    duplicate: 'Duplicado',
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
      <div className="card" style={{ width: '100%', maxWidth: 760, maxHeight: '90vh', overflow: 'auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px', borderBottom: '1px solid var(--border)',
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 'var(--fs-lg)', fontWeight: 700 }}>Importar CSV</h2>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--fg-subtle)' }}>
              Columnas: Name, code, description, category, price1…price6, Stock Quality
            </p>
          </div>
          <button className="btn ghost sm" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ padding: 20 }}>

          {/* ── STEP 1: Upload ── */}
          {step === 'upload' && (
            <>
              <div
                className={`card dashed${dragOver ? ' card-pad' : ''}`}
                style={{
                  padding: 48, textAlign: 'center', cursor: 'pointer',
                  background: dragOver ? 'var(--accent-tint)' : undefined,
                  borderColor: dragOver ? 'var(--accent)' : undefined,
                  transition: 'all 0.15s',
                }}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault(); setDragOver(false)
                  const f = e.dataTransfer.files[0]
                  if (f) handleFile(f)
                }}
              >
                <Upload size={32} style={{ color: 'var(--fg-subtle)', marginBottom: 12 }} />
                <p style={{ margin: '0 0 4px', fontWeight: 600 }}>
                  {loading ? 'Analizando archivo…' : 'Arrastra tu CSV aquí'}
                </p>
                <p className="p-sm" style={{ margin: 0 }}>o haz clic para seleccionar</p>
                <input
                  ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                />
              </div>

              {error && (
                <div style={{
                  display: 'flex', gap: 8, alignItems: 'flex-start',
                  background: 'var(--danger-tint)', color: 'var(--danger)',
                  padding: '10px 14px', borderRadius: 'var(--r-md)', marginTop: 14,
                  fontSize: 'var(--fs-sm)',
                }}>
                  <AlertCircle size={14} style={{ marginTop: 2 }} />{error}
                </div>
              )}
            </>
          )}

          {/* ── STEP 2: Preview ── */}
          {step === 'preview' && preview && (
            <>
              {/* Resumen */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
                {[
                  { label: 'Total',       value: preview.totalRows,    color: 'var(--fg)' },
                  { label: 'Correctos',   value: preview.okCount + preview.warningCount, color: 'var(--ok)' },
                  { label: 'Duplicados',  value: preview.dupCount,     color: 'var(--warn)' },
                  { label: 'Con error',   value: preview.errorCount,   color: 'var(--danger)' },
                ].map((s) => (
                  <div key={s.label} className="card card-pad" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-mono)', color: s.color }}>
                      {s.value}
                    </div>
                    <div className="eyebrow" style={{ marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Opción sobrescribir duplicados */}
              {preview.dupCount > 0 && (
                <label style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: 'var(--warn-tint)', padding: '10px 14px',
                  borderRadius: 'var(--r-md)', marginBottom: 14, cursor: 'pointer',
                  fontSize: 'var(--fs-sm)', color: 'var(--warn)',
                }}>
                  <input
                    type="checkbox"
                    checked={overwrite}
                    onChange={(e) => setOverwrite(e.target.checked)}
                  />
                  Sobrescribir {preview.dupCount} producto(s) duplicado(s) existentes en la base de datos
                </label>
              )}

              {/* Tabla de preview */}
              <div style={{ maxHeight: 320, overflow: 'auto', marginBottom: 16 }}>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th style={{ width: 44 }}>Lín.</th>
                      <th>Nombre</th>
                      <th>Código</th>
                      <th>Categoría</th>
                      <th style={{ width: 80 }}>P1</th>
                      <th style={{ width: 60 }}>Stock</th>
                      <th style={{ width: 80 }}>Imagen</th>
                      <th style={{ width: 90 }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.map((row) => (
                      <tr key={row.line}>
                        <td className="mono" style={{ fontSize: 11, color: 'var(--fg-subtle)' }}>{row.line}</td>
                        <td style={{ fontSize: 13, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {row.name || <span style={{ color: 'var(--danger)' }}>vacío</span>}
                        </td>
                        <td className="mono" style={{ fontSize: 12 }}>{row.code}</td>
                        <td style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{row.category || '—'}</td>
                        <td className="mono" style={{ fontSize: 12 }}>
                          {row.price1 != null ? `Q${row.price1}` : <span style={{ color: 'var(--danger)' }}>—</span>}
                        </td>
                        <td className="mono" style={{ fontSize: 12 }}>{row.stock ?? '—'}</td>
                        <td>
                          <span className={`pill ${row.imageFound ? 'ok' : 'dim'}`} style={{ fontSize: 10 }}>
                            {row.imageFound ? 'vinculada' : 'sin img'}
                          </span>
                        </td>
                        <td>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                            {statusIcon(row.status)}
                            {statusLabel[row.status]}
                          </span>
                          {[...row.errors, ...row.warnings].map((m, i) => (
                            <div key={i} style={{ fontSize: 10, color: 'var(--fg-subtle)', marginTop: 2 }}>· {m}</div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {error && (
                <div style={{
                  background: 'var(--danger-tint)', color: 'var(--danger)',
                  padding: '10px 14px', borderRadius: 'var(--r-md)', marginBottom: 14,
                  fontSize: 'var(--fs-sm)',
                }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button className="btn secondary" onClick={() => setStep('upload')}>← Cambiar archivo</button>
                <button
                  className="btn primary"
                  onClick={handleImport}
                  disabled={loading || (preview.okCount + preview.warningCount + (overwrite ? preview.dupCount : 0)) === 0}
                >
                  {loading ? 'Importando…' : `Importar ${preview.okCount + preview.warningCount + (overwrite ? preview.dupCount : 0)} productos`}
                </button>
              </div>
            </>
          )}

          {/* ── STEP 3: Done ── */}
          {step === 'done' && result && (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <CheckCircle size={48} color="var(--ok)" style={{ marginBottom: 16 }} />
              <h3 style={{ margin: '0 0 8px', fontSize: 'var(--fs-xl)' }}>Importación completada</h3>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 20, marginBottom: 28 }}>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--ok)' }}>{result.imported}</div>
                  <div className="eyebrow">importados</div>
                </div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--fg-subtle)' }}>{result.skipped}</div>
                  <div className="eyebrow">omitidos</div>
                </div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-mono)', color: result.errors > 0 ? 'var(--danger)' : 'var(--fg-subtle)' }}>{result.errors}</div>
                  <div className="eyebrow">con error</div>
                </div>
              </div>
              <button className="btn primary" onClick={onClose}>Cerrar y ver productos</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
