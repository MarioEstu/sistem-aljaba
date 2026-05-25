import { X } from 'lucide-react'

interface Props {
  title:    string
  message:  string
  onConfirm: () => void
  onClose:  () => void
  loading?: boolean
}

export default function ConfirmModal({ title, message, onConfirm, onClose, loading }: Props) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(31,30,26,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="card card-pad" style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 'var(--fs-md)', fontWeight: 700 }}>{title}</h3>
          <button className="btn ghost sm" onClick={onClose}><X size={14} /></button>
        </div>
        <p className="p-sm" style={{ margin: '0 0 20px' }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn secondary" onClick={onClose}>Cancelar</button>
          <button className="btn danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}
